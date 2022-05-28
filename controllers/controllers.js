const SEOChecker = require("advanced-seo-checker");
// const pagespeedInsights = require("pagespeed-insights");
const pagespeed = require('gpagespeed');
const findOrphans = require("find-orphans");
const { structuredDataTest } = require("structured-data-testing-tool");
const parseCanonicalUrl = require("parse-canonical-url");
const httpschecker = require('https-checker');
const Slugify = require('seo-friendly-slugify');
const {
  Google,
} = require("structured-data-testing-tool/presets");
const { default: axios } = require("axios");
var DomParser = require('dom-parser');

// const gsc = require("gsc-cli");
 
module.exports = {
  testApi: async (req, res) => {
    let url = req.query.url;
    // let baseURL = domain_from_url(url);
    let urls = [url];
    let crawler = SEOChecker(url, {});
    
    // const s = new Slugify();
    // console.log(s.slugify(url));
    // return;

    // Check canonical tag
    let pageSource = await axios.get(url).then(res => res.data);
    const parser = new DomParser();
    let dom = parser.parseFromString(pageSource);
    let links = dom.getElementsByTagName('link');
    let isCanonical = false;
    for (var i = 0; i < links.length; i++) {
      if (links[i].getAttribute("rel") === "canonical" && links[i].getAttribute("href") === url) {
        isCanonical = true;
      }
    }

    // Make sure you are using HTTPS
    let isHTTPSUrl = httpschecker.isHTTPSUrl(url);
    console.log("IsHTTPSUrl", isHTTPSUrl);

    // pagespeed
    let opts = {
      url: url,
      key: "AIzaSyAxAiLsn-bmx6FjxShKifYYNTMf-p5LcvA", //key is in Google cloud Platform key.
    };
    let _pagespeed = await pagespeed(opts)
      .then(data => {
        console.log(data)
        return data;
      })
      .catch(error => {
        console.error(error)
        return error;
      })

    // Add structured data
    let _structuredata = await structuredDataTest(url, {
      presets: [Google],
      schemas: ["ReportageNewsArticle"],
    })
      .then((response) => {
        console.log("All tests passed.");
        console.log("Passed:", response.passed.length);
        console.log("Failed:", response.failed.length);
        console.log("Warnings:", response.warnings.length);
        return response;
      })
      .catch((err) => {
        if (err.type === "VALIDATION_FAILED") {
          console.log("❌ Some tests failed.");
          result = err.res;
        } else {
          console.log(err); // Handle other errors here (e.g. an error fetching a URL)
        }
        return err;
      })
      .finally(() => {
        if (result) {
          console.log(
            `Passed: ${result.passed.length},`,
            `Failed: ${result.failed.length},`,
            `Warnings: ${result.warnings.length}`
          );
          console.log(`Schemas found: ${result.schemas.join(",")}`);

          // Loop over validation errors
          if (result.failed.length > 0)
            console.log(
              "⚠️  Errors:\n",
              result.failed.map((test) => test)
            );
          return result;
        }
      });

    // Leverage "Inspect URL" feature in GSC, Ensure your website is mobile-friendly
    let summary = await crawler.analyze(urls).then(function (summary) {
      let util = require('util');
      console.log("..................");
      console.log(util.inspect(summary.issues));
      return util.inspect(summary);
    });

    res.status(200).json({
      leverage: summary,
      pagespeed: _pagespeed,
      canonical: isCanonical,
      Ishttpsurl: isHTTPSUrl,
      StructureData: _structuredata
    });
  },
};
