<div class="popup-modal" id="popup-modal">

    <div class="popup-modal-inline">
        <div ng-if="busy" class="d-flex justify-content-center">
            <div class="d-flex align-items-center">
                <img class="d-inline-block align-top" src="/assets/img/dual_ring-0.9s-200px.svg">
            </div>
        </div>
        <div ng-if="!busy">
            <form ng-if="feedbackSent == false" ng-submit="submitFeedback();">
                <h2 class="mb-0">Feedback & bug report</h2>
                <p class="lead mb-4">Tell us what you think or report a bug or do both - everything is optional here</p>
                <div class="form-group" ng-repeat="question in feedbackQuestions">
                    <div ng-if="question.type == 'starRating'">
                        <span class="lead form-title">{{question.label}}</span>
                        <span class="star-rating star-5">
                        <input type="radio" ng-model="feedback[question._id]" value="1"><i></i>
                        <input type="radio" ng-model="feedback[question._id]" value="2"><i></i>
                        <input type="radio" ng-model="feedback[question._id]" value="3"><i></i>
                        <input type="radio" ng-model="feedback[question._id]" value="4"><i></i>
                        <input type="radio" ng-model="feedback[question._id]" value="5"><i></i>
                    </span>
                    </div>
                    <div ng-if="question.type == 'textarea'">
                        <div class="form-group">
                            <label class="lead">{{question.label}}</label>
                            <textarea class="form-control" rows="3" ng-model="feedback[question._id]"></textarea>
                        </div>
                    </div>
                </div>
                <div class="row">
                    <div class="col">
                        <a id="close-modal" href="javascript:void(0);" class="btn btn-secondary">Cancel</a>
                    </div>
                    <div class="col text-center">

                    </div>
                    <div class="col text-right">
                        <div class="form-group">
                            <button class="btn btn-primary">Send</button>
                        </div>
                    </div>
                </div>
            </form>
            <div ng-if="feedbackSent == true">
                <div class="container lead">
                    <div class="row text-center">
                        <div class="col">
                            <h4 style="color:#00bc4e;font-size: 4rem;"><i class="fas fa-check-circle"></i></h4>
                            <h4 class="display-4">Thank you!</h4>
                            <p>We appreciate your time</p>
                        </div>
                    </div>
                    <div class="row text-center" style="margin: 20px">
                        <div class="col">
                            <a id="close-modal" href="javascript:void(0);" class="btn btn-secondary">Close</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

</div>
