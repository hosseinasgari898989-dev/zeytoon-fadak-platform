/* تنظیمات فرانت‌اند؛ از این فایل می‌توان API و شماره نسخه را تغییر داد. */
(function(){
  var host=window.location.hostname||"";
  var isStaticGithub=/github\.io$/i.test(host);
  window.FADAK_API_BASE=window.FADAK_API_BASE||(window.location.protocol!=="file:"&&!isStaticGithub?window.location.origin:"");
  window.FADAK_BUILD="2026.10.1";
})();