var MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];

var AP_MONTHS = ["Jan.", "Feb.", "March", "April", "May", "June", "July", "Aug.", "Sept.", "Oct.", "Nov.", "Dec."];

var ORDINAL_SUFFIXES = ["th", "st", "nd", "rd"];

var USPS_TO_AP_STATE = {
  AL: "Ala.",
  AK: "Alaska",
  AR: "Ark.",
  AS: "A.S.",
  AZ: "Ariz.",
  CA: "Calif.",
  CO: "Colo.",
  CT: "Conn.",
  DC: "D.C.",
  DE: "Del.",
  FL: "Fla.",
  GA: "Ga.",
  GU: "Guam",
  HI: "Hawaii",
  IA: "Iowa",
  ID: "Idaho",
  IL: "Ill.",
  IN: "Ind.",
  KS: "Kan.",
  KY: "Ky.",
  LA: "La.",
  MA: "Mass.",
  MD: "Md.",
  ME: "Maine",
  MI: "Mich.",
  MN: "Minn.",
  MO: "Mo.",
  MP: "N.M.I.",
  MS: "Miss.",
  MT: "Mont.",
  NC: "N.C.",
  ND: "N.D.",
  NE: "Neb.",
  NH: "N.H.",
  NJ: "N.J.",
  NM: "N.M.",
  NV: "Nev.",
  NY: "N.Y.",
  OH: "Ohio",
  OK: "Okla.",
  OR: "Ore.",
  PA: "Pa.",
  PR: "P.R.",
  RI: "R.I.",
  SC: "S.C.",
  SD: "S.D.",
  TN: "Tenn.",
  TX: "Texas",
  UT: "Utah",
  VA: "Va.",
  VI: "V.I.",
  VT: "Vt.",
  WA: "Wash.",
  WI: "Wis.",
  WV: "W.Va.",
  WY: "Wyo."
};

var classify = function(str) {
  return str
    .toString() // catch numbers that slip through
    .toLowerCase()
    .trim() // trim out extra whitespace from beginning/end
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
};

var comma = v => v.toLocaleString().replace(/\.0+$/, "");

var ordinal = v => (v > 10 && v < 20 ? v + "th" : v + ORDINAL_SUFFIXES[V % 10] || "th");

var ap_month = m => AP_MONTHS[MONTHS.indexOf(m)];

var ap_date = v => {
  var [m, d, y] = v.split("/").map(Number);
  return `${AP_MONTHS[m - 1]} ${d}, ${y}`;
};

var ap_state = usps => USPS_TO_AP_STATE[usps];

var typogr = require("typogr");
var smarty = function(text) {
  text = text
    .toString() // catch numbers that slip through
    .trim(); // trim out extra whitespace from beginning/end
  var typos = [typogr.amp, typogr.smartypants, typogr.widont, typogr.ord];
  var output = typos.reduce((v, f) => f(v), text);
  output = output.replace(/&#8211;/g, "&mdash;")
    .replace(/([’']) ([”"])/g, "$1&nbsp;$2")
    .replace("s&#8217;$2 ","s&rsquo; ");

  return output;
};
var { typogrify } = typogr;

// markdown support
var commonmark = require("commonmark");
var reader = new commonmark.Parser();
var writer = new commonmark.HtmlRenderer();
//monkey-patch writer to handle typographical entities
var escape = writer.escape;
writer.escape = function(str) {
  return escape(str, true);
};

var renderMarkdown = function(input) {
  var parsed = reader.parse(input);

  var walker = parsed.walker();
  //merge text nodes together
  var e;
  var previous;
  while (e = walker.next()) {
    var node = e.node;
    //is this an adjacent text node?
    if (node && previous && previous.parent == node.parent && previous.type == "Text" && node.type == "Text") {
      previous.literal += node.literal;
      node.unlink();
    } else {
      previous = node;
    }
  }

  var rendered = writer.render(parsed);
  return smarty(typogr.widont(rendered));
};

module.exports = {
  classify,
  comma,
  ordinal,
  ap_month,
  ap_date,
  ap_state,
  smarty,
  typogrify,
  renderMarkdown
};
