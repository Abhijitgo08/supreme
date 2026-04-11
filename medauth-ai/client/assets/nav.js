// MedAuth AI — assets/nav.js — global navigation helper

window.APP_BASE = window.location.origin;

window.navigateTo = function(page) {
  var url = window.APP_BASE + '/client/pages/' + page;
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
