App.directive("href", function($rootScope, $timeout) {
    return {
        restrict: "A",
        link: function($scope, $element, $attr) {

            $element.bind("click", function(e) {
                e.preventDefault();
                if ($attr.href !== "javascript:void(0);") {
                    $rootScope.view = $attr.href;
                    $timeout(function() {
                        $rootScope.$apply();
                    }, 0);
                }
            });
        }
    }
});
