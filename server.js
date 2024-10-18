const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

const userController = require("./controllers/UserController");
const foodTypeController = require("./controllers/FoodTypeController");
const foodSizeController = require("./controllers/FoodSizeController");
const tasteController = require("./controllers/TasteController");
const foodController = require("./controllers/FoodController");
const saleTempController = require("./controllers/SaleTempController");
const organizationController = require('./controllers/OrganizationController');
const billSaleController = require('./controllers/BillSaleController');
const reportController = require('./controllers/ReportController');

app.use(cors());
app.use(fileUpload());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/uploads", express.static("./uploads"));

function isSignIn(req, res, next) {
  try {
    const token = req.headers.authorization.split(' ')[1]; // Bearer <token>
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const level = decoded.level;

    if (level !== null) {
      next();
    } else {
      return res.status(401).send({ error: "Unauthorized" });
    }
  } catch (e) {
    return res.status(500).send({ error: e.message });
  }
}

// 
// report
//
app.post('/api/report/sumPerDayInYearAndMonth', (req, res) => reportController.sumPerDayInYearAndMonth(req, res));
app.post('/api/report/sumPerMonthInYear', (req, res) => reportController.sumPerMonthInYear(req, res));

//
// billSale
//
app.post('/api/billSale/list', (req, res) => billSaleController.list(req, res))
app.delete('/api/billSale/remove/:id', (req, res) => billSaleController.remove(req, res))

//
// organization
//
app.post('/api/organization/upload', (req, res) => organizationController.upload(req, res));
app.post('/api/organization/save', (req, res) => organizationController.create(req, res));
app.get('/api/organization/info', (req, res) => organizationController.info(req, res));

//
// saleTemp
//
app.post('/api/saleTemp/printBillAfterPay', (req, res) => saleTempController.printBillAfterPay(req, res))
app.post('/api/saleTemp/printBillBeforePay', (req, res) => saleTempController.printBillBeforePay(req, res))
app.post('/api/saleTemp/endSale', (req, res) => saleTempController.endSale(req, res))
app.delete('/api/saleTemp/removeSaleTempDetail/:id', (req, res) => saleTempController.removeSaleTempDetail(req, res))
app.post('/api/saleTemp/newSaleTempDetail', (req, res) => saleTempController.newSaleTempDetail(req, res))
app.post('/api/saleTemp/updateTaste', (req, res) => saleTempController.updateTaste(req, res))
app.post("/api/saleTemp/updateFoodSize", (req, res) =>
  saleTempController.updateFoodSize(req, res)
);
app.get("/api/saleTemp/listSaleTempDetail/:saleTempId", (req, res) =>
  saleTempController.listSaleTempDetail(req, res)
);
app.post("/api/saleTemp/createDetail", (req, res) =>
  saleTempController.createDetail(req, res)
);
app.put("/api/saleTemp/changeQty", (req, res) =>
  saleTempController.changeQty(req, res)
);
app.delete("/api/saleTemp/remove/:foodId/:userId", (req, res) =>
  saleTempController.remove(req, res)
);
app.delete("/api/saleTemp/clear/:userId", (req, res) =>
  saleTempController.clear(req, res)
);
app.get("/api/saleTemp/list/:userId", (req, res) =>
  saleTempController.list(req, res)
);
app.post("/api/saleTemp/create", (req, res) =>
  saleTempController.create(req, res)
);
//
// food
//
app.post("/api/food/listPaginate", (req, res) => foodController.listPaginate(req, res));
app.get("/api/food/filter/:foodType", (req, res) =>
  foodController.filter(req, res)
);
app.put("/api/food/update", (req, res) => foodController.update(req, res));
app.delete("/api/food/remove/:id", (req, res) =>
  foodController.remove(req, res)
);
app.get("/api/food/list", (req, res) => foodController.list(req, res));
app.post("/api/food/upload", (req, res) => foodController.upload(req, res));
app.post("/api/food/create", (req, res) => foodController.create(req, res));
//
// taste
//
app.get('/api/taste/listByFoodTypeId/:foodTypeId', (req, res) => tasteController.listByFoodTypeId(req, res))
app.put("/api/taste/update", (req, res) => tasteController.update(req, res));
app.delete("/api/taste/remove/:id", (req, res) =>
  tasteController.remove(req, res)
);
app.get("/api/taste/list", (req, res) => tasteController.list(req, res));
app.post("/api/taste/create", (req, res) => tasteController.create(req, res));
//
// food size
//
app.get("/api/foodSize/filter/:foodTypeId", (req, res) =>
  foodSizeController.filter(req, res)
);
app.put("/api/foodSize/update", (req, res) =>
  foodSizeController.update(req, res)
);
app.delete("/api/foodSize/remove/:id", (req, res) =>
  foodSizeController.remove(req, res)
);
app.get("/api/foodSize/list", (req, res) => foodSizeController.list(req, res));
app.post("/api/foodSize/create", (req, res) =>
  foodSizeController.create(req, res)
);
//
// food type
//
app.put("/api/foodType/update", (req, res) =>
  foodTypeController.update(req, res)
);
app.delete("/api/foodType/remove/:id", (req, res) =>
  foodTypeController.remove(req, res)
);
app.get("/api/foodType/list", (req, res) => foodTypeController.list(req, res));
app.post("/api/foodType/create", (req, res) =>
  foodTypeController.create(req, res)
);

//
// user
//
app.get("/api/user/getLevelFromToken", (req, res) => userController.getLevelFromToken(req, res));
app.put("/api/user/update", (req, res) => userController.update(req, res));
app.delete("/api/user/remove/:id", (req, res) => userController.remove(req, res));
app.post("/api/user/create", (req, res) => userController.create(req, res));
app.get("/api/user/list", (req, res) => userController.list(req, res));
app.post("/api/user/signIn", (req, res) => userController.signin(req, res));

app.listen(3000, () => {
  console.log("API Server Running...");
});
