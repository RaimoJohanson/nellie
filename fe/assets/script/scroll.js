 app.directive("scroll", function($window) {
  return function(scope, element, attrs) {
   scope.junn = 0;
   scope.hide_nav = false;
   angular.element($window).bind("scroll", function() {


    if (this.pageYOffset >= $window.innerHeight) {
     scope.hide_nav = true;
     scope.boolChangeClass = 'navbar fixed-top nav-colored';

     //console.log('Scrolled below header.');
    }
    else {
     scope.hide_nav = true;
     scope.boolChangeClass = 'navbar fixed-top nav-transparent';
     //console.log('Header is in view.');
    }
    if (this.pageYOffset > scope.junn && this.pageYOffset >= 10) {
     scope.hide_nav = false;
    }
    //console.log('offset' + scope.junn);
    scope.junn = this.pageYOffset;
    //console.log('Junn' + scope.junn);
    scope.$digest();
   });
  };
 });
 