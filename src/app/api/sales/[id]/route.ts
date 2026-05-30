import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"

async function getSaleId(context: any) {
  const { params } = context
  let saleId = params?.id

  if (context?.params instanceof Promise) {
    const p = await context.params
    saleId = p.id
  }

  return saleId ? String(saleId) : null
}

export async function PATCH(request: Request, context: any) {
  const saleId = await getSaleId(context)

  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { pounds, pricePerPound, paymentStatus, paymentMethod, notes } = body

    if (!saleId) {
      return NextResponse.json({ error: "ID de venta no proporcionado" }, { status: 400 })
    }

    // Buscar venta original
    const originalSale = await prisma.sale.findUnique({
      where: { id: saleId },
      include: {
        customer: true,
      }
    })

    if (!originalSale) {
      return NextResponse.json({ error: "Venta no encontrada" }, { status: 404 })
    }

    // Validaciones basicas
    if (pounds && pounds <= 0) {
      return NextResponse.json({ error: "Las libras deben ser mayores a 0" }, { status: 400 })
    }
    if (pricePerPound && pricePerPound <= 0) {
      return NextResponse.json({ error: "El precio debe ser mayor a 0" }, { status: 400 })
    }

    const newPounds = pounds ?? originalSale.pounds
    const newPrice = pricePerPound ?? originalSale.pricePerPound
    const newTotalAmount = newPounds * newPrice
    const newPaymentStatus = paymentStatus ?? originalSale.paymentStatus
    const newPaymentMethod = paymentMethod ?? originalSale.paymentMethod

    if (newPaymentStatus === "PAID" && !newPaymentMethod) {
      return NextResponse.json({ error: "Método de pago es obligatorio para pagos inmediatos" }, { status: 400 })
    }

    const result = await prisma.$transaction(async (tx: any) => {
      // 1. Revertir impacto financiero de la venta original en el cliente
      const customerRevertData: any = {}
      if (originalSale.paymentStatus === "PAID") {
        customerRevertData.totalPaid = { decrement: originalSale.totalAmount }
      } else {
        customerRevertData.totalDebt = { decrement: originalSale.totalAmount }
      }
      
      await tx.customer.update({
        where: { id: originalSale.customerId },
        data: customerRevertData
      })

      // 2. Manejar impactos en caja (CashMovement) si hubo cambio en paymentStatus o amount
      const isStatusChanged = originalSale.paymentStatus !== newPaymentStatus
      const isAmountChanged = originalSale.totalAmount !== newTotalAmount
      const isPoundsChanged = originalSale.pounds !== newPounds
      const isMethodChanged = originalSale.paymentMethod !== newPaymentMethod

      // Si original fue PAGADO, buscamos el movimiento exacto (por descripción o cercanía)
      // Puede ser ambiguo pero usamos el monto, el usuario, y tipo
      if (originalSale.paymentStatus === "PAID") {
        if (isStatusChanged || isAmountChanged || isMethodChanged || isPoundsChanged) {
          const originalDesc = `Venta a ${originalSale.customer.name} - ${originalSale.pounds} libras`
          
          // Buscar el movimiento
          const movementToRevert = await tx.cashMovement.findFirst({
            where: {
              userId: originalSale.userId,
              movementType: "INCOME",
              amount: originalSale.totalAmount,
              paymentMethod: originalSale.paymentMethod,
              description: originalDesc,
            },
            orderBy: { createdAt: 'desc' }
          })

          if (movementToRevert) {
             // Lo borramos
             await tx.cashMovement.delete({
                 where: { id: movementToRevert.id }
             })
          }
        }
      }

      // 3. Aplicar el impacto financiero de la NUEVA venta en el cliente
      const customerApplyData: any = {}
      if (newPaymentStatus === "PAID") {
        customerApplyData.totalPaid = { increment: newTotalAmount }
      } else {
        customerApplyData.totalDebt = { increment: newTotalAmount }
      }

      await tx.customer.update({
        where: { id: originalSale.customerId },
        data: customerApplyData
      })

      // 4. Crear nuevo movimiento en caja si la venta es ahora PAGADA
      // y si era crédito (isStatusChanged) o si hubo otro cambio en una pagada que requerimos re-crear el mov manual.
      if (newPaymentStatus === "PAID") {
        if (originalSale.paymentStatus !== "PAID" || isAmountChanged || isMethodChanged || isPoundsChanged) {
           await tx.cashMovement.create({
             data: {
               userId: originalSale.userId, // Mantenemos el usuario original que hizo la venta
               movementType: "INCOME",
               amount: newTotalAmount,
               paymentMethod: newPaymentMethod,
               description: `Venta a ${originalSale.customer.name} - ${newPounds} libras`,
               movementDate: new Date()
             }
           })
        }
      }

      // 5. Finalmente, actualizar la venta en si
      const updatedSale = await tx.sale.update({
        where: { id: saleId },
        data: {
          pounds: newPounds,
          pricePerPound: newPrice,
          totalAmount: newTotalAmount,
          paymentStatus: newPaymentStatus,
          paymentMethod: newPaymentStatus === "PAID" ? newPaymentMethod : null,
          notes: notes !== undefined ? notes : originalSale.notes
        },
        include: {
          customer: { select: { id: true, name: true, phone: true } },
          user: { select: { id: true, name: true } },
          batch: { select: { id: true, name: true, number: true } }
        }
      })

      return updatedSale
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error al actualizar venta:", error)
    return NextResponse.json(
      { error: "Error interno del servidor al editar la venta" }, 
      { status: 500 }
    )
  }
}

export async function DELETE(_request: Request, context: any) {
  const saleId = await getSaleId(context)

  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    if (!saleId) {
      return NextResponse.json({ error: "ID de venta no proporcionado" }, { status: 400 })
    }

    const originalSale = await prisma.sale.findUnique({
      where: { id: saleId },
      include: {
        customer: true,
        user: { select: { id: true, name: true } },
        batch: { select: { id: true, name: true } }
      }
    })

    if (!originalSale) {
      return NextResponse.json({ error: "Venta no encontrada" }, { status: 404 })
    }

    if (session.user.role !== "ADMIN" && session.user.id !== originalSale.userId) {
      return NextResponse.json(
        { error: "Solo el vendedor de la venta o un administrador puede eliminarla" },
        { status: 403 }
      )
    }

    if (
      originalSale.paymentStatus !== "PAID" &&
      originalSale.customer.totalDebt - originalSale.totalAmount < -0.01
    ) {
      return NextResponse.json(
        {
          error:
            "No se puede eliminar esta venta porque el cliente ya tiene cobros aplicados. Ajusta esos cobros antes de eliminarla."
        },
        { status: 400 }
      )
    }

    const result = await prisma.$transaction(async (tx: any) => {
      if (originalSale.paymentStatus === "PAID") {
        await tx.customer.update({
          where: { id: originalSale.customerId },
          data: {
            totalPaid: { decrement: originalSale.totalAmount }
          }
        })

        if (originalSale.paymentMethod) {
          const movementToDelete = await tx.cashMovement.findFirst({
            where: {
              userId: originalSale.userId,
              movementType: "INCOME",
              amount: originalSale.totalAmount,
              paymentMethod: originalSale.paymentMethod,
              description: `Venta a ${originalSale.customer.name} - ${originalSale.pounds} libras`
            },
            orderBy: { createdAt: "desc" }
          })

          if (movementToDelete) {
            await tx.cashMovement.delete({
              where: { id: movementToDelete.id }
            })
          }
        }
      } else {
        await tx.customer.update({
          where: { id: originalSale.customerId },
          data: {
            totalDebt: { decrement: originalSale.totalAmount }
          }
        })
      }

      await tx.sale.delete({
        where: { id: saleId }
      })

      return {
        saleId,
        customerId: originalSale.customerId,
        sellerId: originalSale.userId,
        paymentStatus: originalSale.paymentStatus,
        paymentMethod: originalSale.paymentMethod,
        amount: originalSale.totalAmount
      }
    })

    return NextResponse.json({
      message: "Venta eliminada y caja ajustada exactamente",
      deleted: result
    })
  } catch (error) {
    console.error("Error al eliminar venta:", error)
    return NextResponse.json(
      { error: "Error interno del servidor al eliminar la venta" },
      { status: 500 }
    )
  }
}
