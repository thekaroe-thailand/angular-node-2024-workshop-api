const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

module.exports = {
  create: async (req, res) => {
    try {
      const row = await prisma.food.findFirst({
        where: {
          id: req.body.foodId,
        },
      });

      const oldData = await prisma.saleTemp.findFirst({
        where: {
          foodId: req.body.foodId,
        },
      });

      if (oldData == null) {
        await prisma.saleTemp.create({
          data: {
            foodId: req.body.foodId,
            qty: req.body.qty,
            price: row.price,
            userId: req.body.userId,
            tableNo: req.body.tableNo,
          },
        });
      } else {
        await prisma.saleTemp.update({
          data: {
            qty: oldData.qty + 1,
          },
          where: {
            id: oldData.id,
          },
        });
      }

      return res.send({ message: "success" });
    } catch (e) {
      return res.status(500).send({ error: e.message });
    }
  },
  list: async (req, res) => {
    try {
      const rows = await prisma.saleTemp.findMany({
        include: {
          Food: true,
          SaleTempDetails: true,
        },
        where: {
          userId: parseInt(req.params.userId),
        },
        orderBy: {
          id: "desc",
        },
      });

      return res.send({ results: rows });
    } catch (e) {
      return res.status(500).send({ error: e.message });
    }
  },
  clear: async (req, res) => {
    try {
      await prisma.saleTemp.deleteMany({
        where: {
          userId: parseInt(req.params.userId),
        },
      });

      return res.send({ message: "success" });
    } catch (e) {
      return res.status(500).send({ error: e.message });
    }
  },
  remove: async (req, res) => {
    try {
      await prisma.saleTemp.deleteMany({
        where: {
          foodId: parseInt(req.params.foodId),
          userId: parseInt(req.params.userId),
        },
      });

      return res.send({ message: "success" });
    } catch (e) {
      return res.status(500).send({ error: e.message });
    }
  },
  changeQty: async (req, res) => {
    try {
      const oldData = await prisma.saleTemp.findFirst({
        where: {
          id: req.body.id,
        },
      });

      let oldQty = oldData.qty;

      if (req.body.style == "down") {
        oldQty = oldQty - 1;

        if (oldQty < 0) {
          oldQty = 0;
        }
      } else {
        oldQty = oldQty + 1;
      }

      await prisma.saleTemp.update({
        data: {
          qty: oldQty,
        },
        where: {
          id: req.body.id,
        },
      });

      return res.send({ message: "success" });
    } catch (e) {
      return res.status(500).send({ error: e.message });
    }
  },
  createDetail: async (req, res) => {
    try {
      const qty = req.body.qty;
      const foodId = req.body.foodId;
      const saleTempId = req.body.saleTempId;

      const oldData = await prisma.saleTempDetail.findFirst({
        where: {
          foodId: foodId,
          saleTempId: saleTempId,
        },
      });

      if (oldData == null) {
        for (let i = 0; i < qty; i++) {
          await prisma.saleTempDetail.create({
            data: {
              foodId: foodId,
              saleTempId: saleTempId,
            },
          });
        }
      }

      return res.send({ message: "success" });
    } catch (e) {
      return res.status(500).send({ error: e.message });
    }
  },
  listSaleTempDetail: async (req, res) => {
    try {
      const rows = await prisma.saleTempDetail.findMany({
        include: {
          Food: true,
        },
        where: {
          saleTempId: parseInt(req.params.saleTempId),
        },
        orderBy: {
          id: "desc",
        },
      });

      const arr = [];

      for (let i = 0; i < rows.length; i++) {
        const item = rows[i];

        if (item.tasteId != null) {
          const taste = await prisma.taste.findFirst({
            where: {
              id: item.tasteId,
            },
          });

          item.tasteName = taste.name;
        }

        arr.push(item);
      }

      return res.send({ results: arr });
    } catch (e) {
      return res.status(500).send({ error: e.message });
    }
  },
  updateFoodSize: async (req, res) => {
    try {
      const foodSize = await prisma.foodSize.findFirst({
        where: {
          id: req.body.foodSizeId,
        },
      });

      await prisma.saleTempDetail.update({
        data: {
          addedMoney: foodSize.moneyAdded,
        },
        where: {
          id: req.body.saleTempId,
        },
      });

      return res.send({ message: "success" });
    } catch (e) {
      return res.status(500).send({ error: e.message });
    }
  },
  updateTaste: async (req, res) => {
    try {
      await prisma.saleTempDetail.update({
        data: {
          tasteId: req.body.tasteId,
        },
        where: {
          id: req.body.saleTempId,
        },
      });

      return res.send({ message: "success" });
    } catch (e) {
      return res.status(500).send({ error: e.message });
    }
  },
  newSaleTempDetail: async (req, res) => {
    try {
      await prisma.saleTempDetail.create({
        data: {
          saleTempId: req.body.saleTempId,
          foodId: req.body.foodId,
        },
      });

      return res.send({ message: "success" });
    } catch (e) {
      return res.status(500).send({ error: e.message });
    }
  },
  removeSaleTempDetail: async (req, res) => {
    try {
      await prisma.saleTempDetail.delete({
        where: {
          id: parseInt(req.params.id)
        }
      })

      return res.send({ message: "success" });
    } catch (e) {
      return res.status(500).send({ error: e.message })
    }
  },
  endSale: async (req, res) => {
    try {
      const saleTemps = await prisma.saleTemp.findMany({
        include: {
          SaleTempDetails: {
            include: {
              Food: true
            }
          },
          Food: true
        },
        where: {
          userId: req.body.userId
        }
      })

      const billSale = await  prisma.billSale.create({
        data: {
          amount: req.body.amount,
          inputMoney: req.body.inputMoney,
          payType: req.body.payType,
          tableNo: req.body.tableNo,
          userId: req.body.userId,
          returnMoney: req.body.returnMoney
        }
      })

      for (let i = 0; i < saleTemps.length; i++) {
        const item = saleTemps[i];

        if (item.SaleTempDetails.length > 0) {
          // have details
          for (let j = 0; j < item.SaleTempDetails.length; j++) {
            const detail = item.SaleTempDetails[j];
            await prisma.billSaleDetail.create({
              data: {
                billSaleId: billSale.id,
                foodId: detail.foodId,
                tasteId: detail.tasteId,
                moneyAdded: detail.addedMoney,
                price: detail.Food.price
              }
            })
          }
        } else {
          // no details
          await prisma.billSaleDetail.create({
            data: {
              billSaleId: billSale.id,
              foodId: item.foodId,
              price: item.Food.price
            }
          })
        }
      }

      //
      // clear sale temp and detail
      //
      for (let i = 0; i < saleTemps.length; i++) {
        const item = saleTemps[i];

        await prisma.saleTempDetail.deleteMany({
          where: {
            saleTempId: item.id
          }
        })
      }

      await prisma.saleTemp.deleteMany({
        where: {
          userId: req.body.userId
        }
      })

      res.send({ message: "success" });
    } catch (e) {
      return res.status(500).send({ error: e.message })
    }
  }
};

/*



















*/
