const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

module.exports = {
  create: async (req, res) => {
    try {
      await prisma.food.create({
        data: {
          foodTypeId: req.body.foodTypeId,
          name: req.body.name,
          remark: req.body.remark,
          price: req.body.price,
          foodType: req.body.foodType,
          img: req.body.img ?? "",
          status: "use",
        },
      });

      return res.send({ message: "success" });
    } catch (e) {
      return res.status(500).send({ error: e.message });
    }
  },
  upload: async (req, res) => {
    try {
      if (req.files.img !== undefined) {
        const img = req.files.img;
        const fileName = img.name;

        img.mv("uploads/" + fileName, (err) => {
          if (err) {
            res.send({ error: err });
          }
        });

        return res.send({ fileName: fileName });
      } else {
        return res.send({ message: "file not found" });
      }
    } catch (e) {
      return res.status(500).send({ error: e.message });
    }
  },
  list: async (req, res) => {
    try {
      const rows = await prisma.food.findMany({
        include: {
          FoodType: true,
        },
        orderBy: {
          id: "desc",
        },
        where: {
          status: "use",
        },
      });

      return res.send({ results: rows });
    } catch (e) {
      return res.status(500).send({ error: e.message });
    }
  },
  remove: async (req, res) => {
    try {
      await prisma.food.update({
        data: {
          status: "delete",
        },
        where: {
          id: parseInt(req.params.id),
        },
      });

      return res.send({ message: "success" });
    } catch (e) {
      return res.status(500).send({ error: e.message });
    }
  },
  update: async (req, res) => {
    try {
      let img = req.body.img;

      if (img === undefined) {
        const row = await prisma.food.findFirst({
          where: {
            id: req.body.id,
          },
        });

        img = row.img;
      }

      await prisma.food.update({
        data: {
          foodTypeId: req.body.foodTypeId,
          foodType: req.body.foodType,
          name: req.body.name,
          price: req.body.price,
          remark: req.body.remark,
          img: img,
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
  filter: async (req, res) => {
    try {
      const rows = await prisma.food.findMany({
        include: {
          FoodType: true,
        },
        where: {
          foodType: req.params.foodType,
          status: "use",
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
  listPaginate: async (req, res) => {
    try {
      const page = req.body.page ?? 1;
      const pageSize = req.body.pageSize ?? 10;

      // data
      const rows = await prisma.food.findMany({
        skip: (page - 1) * pageSize,
        take: pageSize,
        where: {
          status: "use",
        },
      });

      // total rows
      const total = await prisma.food.count({
        where: {
          status: "use",
        },
      });

      return res.send({ results: rows, total: total });
    } catch (e) {
      return res.status(500).send({ error: e.message });
    }
  },
};
