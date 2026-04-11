// MedAuth AI — assets/nav.js — global navigation helper

window.APP_BASE = window.location.origin;

window.navigateTo = function(page) {
  // Strip any path prefixes if accidentally passed
  var filename = page.split('/').pop();
  var url = window.location.origin + '/client/pages/' + filename;
  if (typeof gsap !== 'undefined' && gsap.to) {
    gsap.to('body', {
      opacity: 0,
      y: -20,
      duration: 0.25,
      ease: 'power2.in',
      onComplete: function() {
        window.location.href = url;
      }
    });
  } else {
    window.location.href = url;
  }
};

window.pageIn = function() {
  if (typeof gsap !== 'undefined' && gsap.from) {
    gsap.from('body', {
      opacity: 0,
      y: 20,
      duration: 0.4,
      ease: 'power2.out'
    });
  }
};

document.addEventListener('DOMContentLoaded', function() {
  window.pageIn();
});
