import { handleRequest } from "./core";

const worker = { fetch: handleRequest };

export default worker;
