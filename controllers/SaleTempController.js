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

      await prisma.saleTemp.create({
        data: {
          foodId: req.body.foodId,
          qty: req.body.qty,
          price: row.price,
          userId: req.body.userId,
          tableNo: req.body.tableNo,
        },
      });

      return res.send({ message: "success" });
    } catch (e) {
      return res.status(500).send({ error: e.message });
    }
  },
};
