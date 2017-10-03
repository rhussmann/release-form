module.exports = {
  templateUrl: process.env.TEMPLATE_URL || "http://localhost:8000/basic.mustache",
  renderUrl: process.env.RENDER_URL || "http://localhost:8000/render"
};
