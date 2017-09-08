angular.module("atApp", ['ui.router', 'oc.lazyLoad'])
	.config(function ($stateProvider, $urlRouterProvider) {
		$urlRouterProvider.otherwise('/home');
		$stateProvider
			.state("dashboard", {
				url: "",
				templateUrl: "pages/dashboard.html",
				abstract: true
			})
			.state("dashboard.home", {
				url: "/home",
				templateUrl: "pages/home.html",
				controller: "homeCtrl",
				resolve: {
					loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
						return $ocLazyLoad.load({
							name: 'Home',
							files: ['./ctrls/home.js']
						})
    				}]
				}
			})
			.state("dashboard.register", {
				url: "/register",
				templateUrl: "pages/register.html",
				controller: "registerCtrl",
				resolve: {
					loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
						return $ocLazyLoad.load({
							name: 'Register',
							files: ['./ctrls/register.js']
						})
					}]
				}
			})
			.state("dashboard.login", {
				url: "/login",
				templateUrl: "pages/login.html",
				controller: "loginCtrl",
				resolve: {
					loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
						return $ocLazyLoad.load({
							name: 'Login',
							files: ['./ctrls/login.js']
						})
					}]
				}
			});
	});


// Global Controller
angular.module('atApp')
	.controller('globalCtrl', function ($scope, $rootScope, $location, $http, $state, $ocLazyLoad) {
		$rootScope.apiUrl = 'http://localhost:3000/';
		$ocLazyLoad.load(['./plugins/sweetalert2/sweetalert2.min.js', './plugins/sweetalert2/sweetalert2.min.css'])
		$rootScope.checkAuth = function () {
			if (Cookies.get('authKey')) {
				$rootScope.authKey = Cookies.get('authKey');
				$http({
						method: 'GET',
						url: $rootScope.apiUrl + 'user',
						params: {
							authKey: $rootScope.authKey
						}
					})
					.then(function (res) {
						if (res.data.status == true) {
							$rootScope.homeData = res.data.data;
							console.log(res.data.data)
						} else {
							$rootScope.logout();
							swal({
								title: 'Failed',
								text: res.data.msg,
								type: 'error',
								timer: 2000,
								showConfirmButton: true
							});
						}
					}, function (res) {
						$('#btnLoad').button('reset');
						swal("Fail", "Some error occurred, try again.", "error");
					});
				var path = $location.path();
				if (path == '/login' || path == '/register')
					$state.go('dashboard.home');
				$rootScope.signStatus = true;
			} else {
				$rootScope.authKey = '';
				$rootScope.signStatus = false;
				var path = $location.path();
				if (path == '/home' || path == '')
					$state.go('dashboard.login');
			}
		};
		$rootScope.logout = function () {
			Cookies.remove('authKey');
			swal("Success", "Logged out successfully !!", "success");
		};
		$rootScope.openModal = function (x, y) {
			$('#' + x).modal('show');
			$scope.modalData = y;
		};
	});
