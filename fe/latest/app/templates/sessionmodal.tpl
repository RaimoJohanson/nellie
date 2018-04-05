<div class="popup-modal" id="popup-modal">

    <div class="popup-modal-inline">
        <div ng-if="busy" class="d-flex justify-content-center">
            <div class="d-flex align-items-center">
                <img class="d-inline-block align-top" src="/assets/img/dual_ring-0.9s-200px.svg">
            </div>
        </div>
        <div ng-if="!busy">
            <h2>Session no. {{sessionData.session_id}}</h2>
            <hr>
            <div class="row">
                <div class="col">
                    <h3>{{sessionData.report.name}}</h3>
                    <table class="table table-striped" ng-if="sessionData.report.list.length">
                        <tr class="lead">
                            <th>Fault title</th>
                            <th>Fitness</th>
                            <th>Probability</th>
                        </tr>
                        <tr ng-repeat="record in sessionData.report.list">
                            <td>{{record.label_value}}</td>
                            <td>{{record.fitness}}</td>
                            <td> {{(record.probability * 100).toFixed(0)}}%</td>
                        </tr>
                    </table>
                    <p class="lead" ng-if="!sessionData.report.list.length">
                        Did not predict anything
                    </p>
                </div>
            </div>
            <div class="row">
                <div class="col">
                    <h3>{{sessionData.answers.name}}</h3>
                    <table class="table table-striped">
                        <tr class="lead">
                            <th>Question</th>
                            <th>Information gain</th>
                            <th>Elapsed time</th>
                            <th>Decision</th>
                        </tr>
                        <tr ng-repeat="record in sessionData.answers.list">
                            <td>{{record.feature_value}}</td>
                            <td>{{record.gain}}</td>
                            <td>{{(record.elapsedTime / 1000).toFixed(1)}} sec</td>
                            <td>{{answerTranslate(record.decision)}}</td>
                        </tr>
                    </table>
                </div>
            </div>

        </div>
    </div>

</div>
