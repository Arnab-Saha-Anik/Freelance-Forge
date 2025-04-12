const express = require("express");
const dotenv = require("dotenv"); 
const cors = require("cors"); 
const connectDB = require("./config/database"); 
const userController = require("./controllers/userController"); 
const freelancerInformationController = require("./controllers/freelancerInformationController"); 
const projectController = require("./controllers/projectController"); 
const notificationController = require("./controllers/notificationController");
const directHireController = require("./controllers/directHireController");
dotenv.config();


connectDB();

const app = express();


app.use(cors()); 


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use("/users", userController); 
app.use("/projects", projectController);
app.use("/freelancers", freelancerInformationController); 
app.use("/notifications", notificationController);
app.use("/direct-hire", directHireController);



const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on port http://localhost:${PORT}`)
);






