import {listenForCreateDesignPOSTRequest} from "@src/routes/designs/POST_CreateDesign";
import {Hono} from "hono";

const app = new Hono().get("/", c => c.json({message: "Hello from Hono!"}));

listenForCreateDesignPOSTRequest(app);

export default app;
