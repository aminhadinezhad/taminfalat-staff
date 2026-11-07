/*
 * «از صفحه عکس بگیر». A web page can't take the phone's own screenshot, so the button saves the
 * card's picture instead (cards/First-Last.png, made beforehand at three times the size).
 * - iPhone and iPad: the share sheet opens with the picture; «Save Image» puts it in Photos.
 *   Safari only opens it straight from the tap, so the picture is fetched when the page opens.
 * - Android and computers: the picture downloads (on Android it shows in the gallery's Downloads).
 * If none of that works (an app's own browser, say), the picture opens by itself, to keep with a
 * long press.
 */
(function () {
  'use strict';

  var button = document.querySelector('[data-card]');
  if (!button) return;
  var url = button.getAttribute('data-card');
  var name = button.getAttribute('data-file');
  var ios = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  var canShareFiles = ios && typeof File === 'function' && navigator.canShare && navigator.share;

  var file = null;
  var loading = null;
  if (canShareFiles) {
    loading = fetch(url)
      .then(function (r) {
        if (!r.ok) throw new Error(r.status);
        return r.blob();
      })
      .then(function (blob) {
        file = new File([blob], name, { type: 'image/png' });
        return file;
      })
      .catch(function () {
        return null;
      });
  }

  function download() {
    var a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  function share(f) {
    if (!navigator.canShare({ files: [f] })) {
      window.location.href = url;
      return;
    }
    navigator.share({ files: [f] }).catch(function (e) {
      // closing the sheet is the person's choice; anything else: the picture on its own
      if (!e || e.name !== 'AbortError') window.location.href = url;
    });
  }

  button.addEventListener('click', function () {
    if (!canShareFiles) {
      download();
      return;
    }
    if (file) {
      share(file);
      return;
    }
    // still loading on a slow connection: once it's here the sheet may not open from this tap
    button.setAttribute('aria-busy', 'true');
    loading.then(function (f) {
      button.removeAttribute('aria-busy');
      if (f) share(f);
      else window.location.href = url;
    });
  });
})();
