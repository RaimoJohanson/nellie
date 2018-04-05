App.directive("sessionmodal", function($templateCache, $http, $compile, $document, $rootScope, $timeout) {
    return {
        restrict: "A",
        scope: false,
        link: function($scope, $element, $attrs) {
            var getDetails = (session_id) => {
                $http.get(API_URL + '/admin/session/' + session_id).then(function(response) {

                    $scope.sessionData = response.data;
                    $scope.sessionData.session_id = session_id;
                    $scope.busy = false;
                }).catch(err => $scope.err = err);
            };


            function openModal(session_id) {

                console.log('openModal');

                $("body").addClass("modal-open");

                $http.get('app/templates/sessionmodal.tpl').then(function(response) {

                    var modal = $compile(response.data)($scope);

                    $document.find('body').eq(0).append(modal);

                    $('#popup-modal').bind("click", function(e) {
                        if ($(e.target).is("#popup-modal, #close-modal")) {
                            $(this).remove();
                            $("body").removeClass("modal-open");
                            state = 0;
                        }

                    });

                    $timeout(function() {
                        $scope.$apply();
                    }, 0);

                    getDetails(session_id)
                });
            };

            $element.bind("click", function(e) {
                e.preventDefault();
                console.log($attrs.id);
                var id = $attrs.id ? $attrs.id : null;
                if (id) {
                    $scope.busy = true;
                    openModal(id);
                }

            });

        }
    }
});
