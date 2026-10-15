const fs = require("fs");
const crypto = require("crypto");

// Short content hash per stylesheet, appended to its URL in base.njk.
// The CDN caches /css/index.css for four hours, so without a hash in the
// query a CSS change stays invisible that long while the HTML (ten minute
// cache) already references the new markup.
function hash(file) {
  try {
    return crypto.createHash("md5").update(fs.readFileSync(file)).digest("hex").slice(0, 8);
  } catch (e) {
    return "";
  }
}

module.exports = function() {
  return {
    css: hash("css/index.css")
  };
};
