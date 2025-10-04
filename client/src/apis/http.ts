import axios from "axios";

const http = axios.create({
  baseURL: "http://localhost:8080", // đúng port json-server của bạn
  headers: { "Content-Type": "application/json" },
});

export default http;
