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

      const billSale = await prisma.billSale.create({
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
          if (item.qty > 0) {
            // qty > 1
            for (let j = 0; j < item.qty; j++) {
              await prisma.billSaleDetail.create({
                data: {
                  billSaleId: billSale.id,
                  foodId: item.foodId,
                  price: item.Food.price
                }
              })
            }
          } else {
            // qty = 1
            await prisma.billSaleDetail.create({
              data: {
                billSaleId: billSale.id,
                foodId: item.foodId,
                price: item.Food.price
              }
            })
          }
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
  },
  printBillBeforePay: async (req, res) => {
    try {
      // organization
      const organization = await prisma.organization.findFirst();

      // rows in saleTemps
      const saleTemps = await prisma.saleTemp.findMany({
        include: {
          Food: true,
          SaleTempDetails: true
        },
        where: {
          userId: req.body.userId,
          tableNo: req.body.tableNo
        }
      });

      // create bill by pkfkit
      const pdfkit = require('pdfkit');
      const fs = require('fs');
      const dayjs = require('dayjs');

      const paperWidth = 80;
      const padding = 3;

      const doc = new pdfkit({
        size: [paperWidth, 200],
        margins: {
          top: 3,
          bottom: 3,
          left: 3,
          right: 3,
        },
      });
      const fileName = `uploads/bill-${dayjs(new Date()).format('YYYYMMDDHHmmss')}.pdf`;
      const font = 'Kanit/kanit-regular.ttf';

      doc.pipe(fs.createWriteStream(fileName));

      // display logo
      const imageWidth = 20;
      const positionX = (paperWidth / 2) - (imageWidth / 2);
      doc.image('uploads/' + organization.logo, positionX, 5, {
        align: 'center',
        width: imageWidth,
        height: 20
      })
      doc.moveDown();

      doc.font(font);
      doc.fontSize(5).text('*** ใบแจ้งรายการ ***', 20, doc.y + 8);
      doc.fontSize(8);
      doc.text(organization.name, padding, doc.y);
      doc.fontSize(5);
      doc.text(organization.address);
      doc.text(`เบอร์โทร: ${organization.phone}`);
      doc.text(`เลขประจำตัวผู้เสียภาษี: ${organization.taxCode}`);
      doc.text(`โต๊ะ: ${req.body.tableNo}`, { align: 'center' });
      doc.text(`วันที่: ${dayjs(new Date()).format('DD/MM/YYYY HH:mm:ss')}`, { align: 'center' });
      doc.text('รายการอาหาร', { align: 'center' });
      doc.moveDown();

      const y = doc.y;
      doc.fontSize(4);
      doc.text('รายการ', padding, y);
      doc.text('ราคา', padding + 18, y, { align: 'right', width: 20 });
      doc.text('จำนวน', padding + 36, y, { align: 'right', width: 20 });
      doc.text('รวม', padding + 55, y, { align: 'right' });

      // line
      // set border height
      doc.lineWidth(0.1);
      doc.moveTo(padding, y + 6).lineTo(paperWidth - padding, y + 6).stroke();

      // loop saleTemps
      saleTemps.map((item, index) => {
        const y = doc.y;
        doc.text(item.Food.name, padding, y);
        doc.text(item.Food.price, padding + 18, y, { align: 'right', width: 20 });
        doc.text(item.qty, padding + 36, y, { align: 'right', width: 20 });
        doc.text(item.Food.price * item.qty, padding + 55, y, { align: 'right' });
      });

      // sum amount
      let sumAmount = 0;
      saleTemps.forEach((item) => {
        sumAmount += item.price * item.qty;
      });

      // display amount
      doc.text(`รวม: ${sumAmount} บาท`, { align: 'right' });
      doc.end();

      return res.send({ message: 'success', fileName: fileName });
    } catch (e) {
      return res.status(500).send({ error: e.message })
    }
    /*
    try {
      // organization info
      const organization = await prisma.organization.findFirst();

      // rows in saleTemps
      const saleTemps = await prisma.saleTemp.findMany({
        include: {
          Food: true,
          SaleTempDetails: true
        },
        where: {
          userId: req.body.userId,
          tableNo: req.body.tableNo
        }
      })

      // create bill by pdfkit
      const pdfkit = require("pdfkit");
      const fs = require("fs");
      const dayjs = require("dayjs");

      const paperWidth = 80;
      const padding = 3;

      const doc = new pdfkit({
        size: [paperWidth, 200],
        margin: {
          top: 3,
          bottom: 3,
          left: 3,
          right: 3
        }
      })

      const fileName = 'uploads/bill-' + dayjs(new Date()).format("YYYY-MM-DD-HH-mm-ss") + '.pdf';
      const font = 'Kanit/kanit-regular.ttf';

      doc.pipe(fs.createWriteStream(fileName));
      doc.font(font);
      doc.fontSize(8);
      doc.text(organization.name, padding, 10);
      /*
      doc.fontSize(5);
      doc.text(organization.address);
      doc.text('เบอร์โทร: ' + organization.phone);
      doc.text('เลขประจำตัวผู้เสียภาษี: ' + organization.taxCode);
      doc.text('โต้ะ: ' + req.body.tableNo, { align: 'center' });
      doc.text('วันที่: ' + dayjs(new Date()).format("YYYY-MM-DD HH:mm:ss"), { align: 'center' });
      doc.text('รายการอาหาร', { align: 'center' });
      doc.moveDown();

      const y = doc.y;
      doc.fontSize(4);
      doc.text('รายการ', padding, y);
      doc.text('ราคา', padding + 18, y, { align: 'right', width: 20 });
      doc.text('จำนวน', padding + 36, y, { align: 'right', width: 20 });
      doc.text('รวม', padding + 55, y, { align: 'right' });

      // line 
      doc.lineWidth(0.1);
      doc.moveTo(padding, y + 6).lineTo(paperWidth - padding, y + 6).stroke();

      // loop saleTemps
      saleTemps.forEach((item, index) => {
        const y = doc.y;
        doc.text(item.Food.name, padding, y);
        doc.text(item.Food.price, padding + 18, y, { align: 'right', width: 20 });
        doc.text(item.qty, padding + 36, y, { align: 'right', width: 20 });
        doc.text(item.Food.price * item.qty, padding + 55, y, { align: 'right' });
      });

      // sum amount 
      let sumAmount = 0;
      saleTemps.forEach((item) => {
        sumAmount += item.Food.price * item.qty;
      });

      // dislay sum amount
      doc.text('รวม' + sumAmount + ' บาท', { align: 'right' });
      
      doc.end();

      return res.send({ message: 'success', fileName: fileName });
    } catch (e) {
      return res.status(500).send({ error: e.message })
    }
    */
  },
  printBillAfterPay: async (req, res) => {
    try {
      // organization
      const organization = await prisma.organization.findFirst();

      // billSale
      const billSale = await prisma.billSale.findFirst({
        where: {
          userId: req.body.userId,
          tableNo: req.body.tableNo,
          status: 'use'
        },
        include: {
          BillSaleDetails: {
            include: {
              Food: true
            }
          },
          User: true
        },
        orderBy: {
          id: 'desc'
        }
      })

      // saleTemps
      const billSaleDetails = billSale.BillSaleDetails;

      // create bill by pkfkit
      const pdfkit = require('pdfkit');
      const fs = require('fs');
      const dayjs = require('dayjs');

      const paperWidth = 80;
      const padding = 3;

      const doc = new pdfkit({
        size: [paperWidth, 200],
        margins: {
          top: 3,
          bottom: 3,
          left: 3,
          right: 3,
        },
      });
      const fileName = `uploads/invoice-${dayjs(new Date()).format('YYYYMMDDHHmmss')}.pdf`;
      const font = 'Kanit/kanit-regular.ttf';

      doc.pipe(fs.createWriteStream(fileName));

      // display logo
      const imageWidth = 20;
      const positionX = (paperWidth / 2) - (imageWidth / 2);
      doc.image('uploads/' + organization.logo, positionX, 5, {
        align: 'center',
        width: imageWidth,
        height: 20
      })
      doc.moveDown();

      doc.font(font);
      doc.fontSize(5).text('*** ใบเสร็จรับเงิน ***', 20, doc.y + 8);
      doc.fontSize(8);
      doc.text(organization.name, padding, doc.y);
      doc.fontSize(5);
      doc.text(organization.address);
      doc.text(`เบอร์โทร: ${organization.phone}`);
      doc.text(`เลขประจำตัวผู้เสียภาษี: ${organization.taxCode}`);
      doc.text(`โต๊ะ: ${req.body.tableNo}`, { align: 'center' });
      doc.text(`วันที่: ${dayjs(new Date()).format('DD/MM/YYYY HH:mm:ss')}`, { align: 'center' });
      doc.text('รายการอาหาร', { align: 'center' });
      doc.moveDown();

      const y = doc.y;
      doc.fontSize(4);
      doc.text('รายการ', padding, y);
      doc.text('ราคา', padding + 18, y, { align: 'right', width: 20 });
      doc.text('จำนวน', padding + 36, y, { align: 'right', width: 20 });
      doc.text('รวม', padding + 55, y, { align: 'right' });

      // line
      // set border height
      doc.lineWidth(0.1);
      doc.moveTo(padding, y + 6).lineTo(paperWidth - padding, y + 6).stroke();

      // loop saleTemps
      billSaleDetails.map((item, index) => {
        const y = doc.y;
        doc.text(item.Food.name, padding, y);
        doc.text(item.Food.price, padding + 18, y, { align: 'right', width: 20 });
        doc.text(1, padding + 36, y, { align: 'right', width: 20 });
        doc.text(item.price * 1, padding + 55, y, { align: 'right' });
      });

      // sum amount
      let sumAmount = 0;
      billSaleDetails.forEach((item) => {
        sumAmount += item.price * 1;
      });

      // display amount
      doc.text(`รวม: ${sumAmount}`, padding, doc.y, { align: 'right', width: paperWidth - padding - padding });

      doc.text('รับเงิน ' + billSale.inputMoney, padding, doc.y, { align: 'right', width: paperWidth - padding - padding });

      doc.text('เงินทอน ' + billSale.returnMoney, padding, doc.y, { align: 'right', width: paperWidth - padding - padding });

      doc.end();

      return res.send({ message: 'success', fileName: fileName });
    } catch (e) {
      return res.status(500).send({ error: e.message })
    }
  }
};

/*



















*/
