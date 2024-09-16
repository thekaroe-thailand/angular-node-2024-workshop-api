const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

module.exports = {
  create: async (req, res) => {
    try {
      await prisma.taste.create({
        data: {
          name: req.body.name,
          remark: req.body.remark,
          foodTypeId: req.body.foodTypeId,
          status: "use",
        },
      });

      return res.send({ message: "success" });
    } catch (e) {
      return res.status(500).send({ error: e.message });
    }
  },
};
