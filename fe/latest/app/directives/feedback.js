App.directive("feedback", function($templateCache, $http, $compile, $document, $rootScope, $timeout) {
    return {
        restrict: "A",
        scope: false,
        link: function($scope, $element, $attrs) {
            var state = 0;
            $scope.feedbackQuestions = [{
                    _id: 1,
                    label: "Ease of adding a new fault?",
                    type: 'starRating'
                },
                {
                    _id: 2,
                    label: "Understandability of the questions?",
                    type: 'starRating'
                }, {
                    _id: 3,
                    label: "Accuracy of the results?",
                    type: 'starRating'
                }, {
                    _id: 4,
                    label: "Suggestions",
                    type: 'textarea'
                }, {
                    _id: 5,
                    label: "Bug report",
                    type: 'textarea'
                }
            ];
            $scope.submitFeedback = function() {
                $scope.busy = true;
                var payload = [];
                for (var question in $scope.feedback) {
                    $scope.feedbackQuestions.forEach(fq => {
                        if (fq._id == question) {
                            payload.push({
                                question: fq.label,
                                value: $scope.feedback[question]
                            })
                        }
                    })
                }

                $http({
                    url: API_URL + '/feedback/' + $rootScope.session_id,
                    method: "post",
                    data: payload
                }).then(function(response) {
                    $scope.busy = false;
                    $scope.feedbackSent = true;

                }).catch(err => {
                    $scope.alertBox(err.data);
                });
            };

            function openModal() {
                if (state == 1) { return false; }
                state = 1;
                $scope.feedbackSent = false;
                console.log('openModal');
                $scope.feedback = {};
                $("body").addClass("modal-open");

                $http.get('app/templates/feedbackmodal.tpl').then(function(response) {

                    //$("body").append(response.data);
                    //console.log($document.find("#popup-modal"));

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
                });
            };

            $element.bind("click", function(e) {
                e.preventDefault();
                openModal();
            });
        }
    }
});
