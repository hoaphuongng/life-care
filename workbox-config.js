module.exports = {
	"globDirectory": "public/",
	"globPatterns": [
	"**/*.{html,json,css,js}",
	"src/images/*.{png,jpg}",
	"src/images/icons/logo-icon-16x16.png",
	"src/images/icons/logo-icon-256x256.png"
	],
	"swDest": "public/service-worker.js",
	"swSrc": "public/sw-base.js",
	"globIgnores": [
		"claim-history/**"
	]
};
