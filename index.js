import { initServer } from "./configs/app.js"
import { connect } from "./configs/mong.js"
import { userDefault } from "./src/user/user.controller.js"

initServer()
connect()
userDefault()