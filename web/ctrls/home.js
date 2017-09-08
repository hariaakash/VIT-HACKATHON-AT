angular.module('atApp')
	.controller('homeCtrl', function ($scope, $rootScope, $http, $location, $state, $timeout, $window) {
		$rootScope.checkAuth();
		$scope.emotions = ["Angry", "Disgust", "Fear", "Happy", "Sad", "Surprised", "Neutral"];
	});
