
//BC Sequence
//Set
//Ante
//Reveal
//Active
//Reactive
//Recycle

//reset

//TODO:
//reset 
//ultimate +
//recycle +
//extra force +
//disable extra force +
//round recycle vars +
//submit game

var start_json = {
    "rand_id": null,
    "game_start_ts": null,
    "force_pool": 41,
    "beat_number": 1,
    "player_1_id": null,
    "player_2_id": null,
    "player_1_fighter": null,
    "player_2_fighter": null,
    "player_1_alt_used": false,
    "player_2_alt_used": false,
    "current_beat_rec": {
        "player_1": {
            "life": 20,
            "force": 2,
            "speed_up": false,
            "power_up": false,
            "defense_up": false,
            "extra_force": false
        },
        "player_2": {
            "life": 20,
            "force": 2,
            "speed_up": false,
            "power_up": false,
            "defense_up": false,
            "extra_force": false
        }
    },
    "beats": {}
}

var app = angular.module('myApp', []);

app.directive('ngConfirmClick', [
    function () {
        return {
            link: function (scope, element, attr) {
                var msg = attr.ngConfirmClick || "Are you sure?";
                var clickAction = attr.confirmedClick;
                element.bind('click', function (event) {
                    if (window.confirm(msg)) {
                        scope.$eval(clickAction)
                    }
                });
            }
        };
    }])

app.controller('btlcn', function ($scope) {


    // for testing
    // localStorage.clear()

    // Global vars
    function set_up_game() {
        $scope.GAME_RECORD = {};
        LAST_BEAT = false;
        $scope.extra_force_p1 = 'Extra Force';
        $scope.extra_force_p2 = 'Extra Force';
        $scope.speed_up_p1 = 'Speed Up';
        $scope.power_up_p1 = 'Power Up';
        $scope.defense_up_p1 = 'Defense Up';
        $scope.speed_up_p2 = 'Speed Up';
        $scope.power_up_p2 = 'Power Up';
        $scope.defense_up_p2 = 'Defense Up';
    };

    // Helper Functions
    function log_it() {
        beat = $scope.GAME_RECORD['beat_number'];
        $scope.GAME_RECORD['beats'][beat] = JSON.parse(JSON.stringify($scope.GAME_RECORD['current_beat_rec']));

        localStorage.setItem("battlecon_tools", JSON.stringify($scope.GAME_RECORD));
    };
    function get_start_json() {
        // $.getJSON( "{{url_for('static', filename='start.json')}}", function( data ) {
        // $.getJSON( "start.json", function( data ) {
        $scope.GAME_RECORD = JSON.parse(JSON.stringify(start_json));
        $scope.GAME_RECORD['rand_id'] = Math.random();
        $scope.GAME_RECORD['game_start_ts'] = new Date().getTime();
        log_it()
    };
    function sleep(milliseconds) {
        var start = new Date().getTime();
        for (var i = 0; i < 1e7; i++) {
          if ((new Date().getTime() - start) > milliseconds){
            break;
          }
        }
      }

    function check_for_saved_game() {
        // load saved game or create a new one
        saved_game = localStorage.getItem("battlecon_tools");
        if (saved_game != null) {
            $scope.GAME_RECORD = JSON.parse(saved_game)
        } else {
            get_start_json()
        }
    }

    // Buttons

    function mod_life(player_num, d_type) {
        beat = $scope.GAME_RECORD['beat_number'];
        current_player = 'player_' + player_num
        if (d_type == 'damage') {
            $scope.GAME_RECORD['current_beat_rec'][current_player]['life'] = $scope.GAME_RECORD['current_beat_rec'][current_player]['life'] - 1;

        } else {
            $scope.GAME_RECORD['current_beat_rec'][current_player]['life'] = $scope.GAME_RECORD['current_beat_rec'][current_player]['life'] + 1;
        }

        log_it()
    }
    $scope.btn_life_mod = function (player_num, d_type) {

        mod_life(player_num, d_type);
    };

    function recycle_beat() {
        //give force
        force_taken = 0;
        ['player_1', 'player_2'].forEach(function (player_id) {
            player = $scope.GAME_RECORD['current_beat_rec'][player_id];
            if (player['life'] <= 7) {
                player['force'] = player['force'] + 2
                force_taken = force_taken + 2
            } else {
                player['force'] = player['force'] + 1
                force_taken = force_taken + 1
            }

            if (player['force'] >= 10) {
                player['force'] = 10;
            }
        });

        force_pool = $scope.GAME_RECORD['force_pool'];
        $scope.GAME_RECORD['force_pool'] = force_pool - force_taken;
        if (force_pool <= 0) {
            LAST_BEAT = true;
            alert('Last Beat!');
            // $scope.GAME_RECORD['force_pool'] = 0;
        }

        log_it()

        //prep next beat
        $scope.GAME_RECORD['beat_number'] = $scope.GAME_RECORD['beat_number'] + 1;
        $scope.extra_force_p1 = 'Extra Force';
        $scope.extra_force_p2 = 'Extra Force';
        $scope.speed_up_p1 = 'Speed Up';
        $scope.power_up_p1 = 'Power Up';
        $scope.defense_up_p1 = 'Defense Up';
        $scope.speed_up_p2 = 'Speed Up';
        $scope.power_up_p2 = 'Power Up';
        $scope.defense_up_p2 = 'Defense Up';
        ['player_1', 'player_2'].forEach(function (player_id) {
            player = $scope.GAME_RECORD['current_beat_rec'][player_id];
            player['speed_up'] = false;
            player['power_up'] = false;
            player['defense_up'] = false;
            player['extra_force'] = false;
        });

    };
    $scope.recycle = function () {
        recycle_beat();
        force_power_check();
        log_it()
    };

    function mod_force(player_id, mod, amt = 1) {
        if (mod == 'add') {
            $scope.GAME_RECORD['force_pool'] = $scope.GAME_RECORD['force_pool'] - amt;
            $scope.GAME_RECORD['current_beat_rec'][player_id]['force'] = $scope.GAME_RECORD['current_beat_rec'][player_id]['force'] + amt;
        } else {
            $scope.GAME_RECORD['force_pool'] = $scope.GAME_RECORD['force_pool'] + amt;
            $scope.GAME_RECORD['current_beat_rec'][player_id]['force'] = $scope.GAME_RECORD['current_beat_rec'][player_id]['force'] - amt;
        }
    }

    function extra_force_func(player_id) {
        if ($scope.GAME_RECORD['current_beat_rec'][player_id]['extra_force'] == false) {
            if (player_id == 'player_1') {
                $scope.extra_force_p1 = '+1 Force';
            } else {
                $scope.extra_force_p2 = '+1 Force';
            }
            $scope.GAME_RECORD['current_beat_rec'][player_id]['extra_force'] = true;
            mod_force(player_id, 'add')
        } else {
            if (player_id == 'player_1') {
                $scope.extra_force_p1 = 'Extra Force';
            } else {
                $scope.extra_force_p2 = 'Extra Force';
            }
            $scope.GAME_RECORD['current_beat_rec'][player_id]['extra_force'] = false;
            mod_force(player_id, 'sub')
        }
    }
    $scope.extra_force = function (player_num) {
        player_id = 'player_' + player_num
        extra_force_func(player_id);
        force_power_check();
        log_it()
    };

    function speed_up_func(player_id) {
        if ($scope.GAME_RECORD['current_beat_rec'][player_id]['speed_up'] == false) {
            if (player_id == 'player_1') {
                $scope.speed_up_p1 = '+2 Speed';
            } else {
                $scope.speed_up_p2 = '+2 Speed';
            }
            $scope.GAME_RECORD['current_beat_rec'][player_id]['speed_up'] = true;
            $scope.GAME_RECORD['current_beat_rec'][player_id]['force'] = $scope.GAME_RECORD['current_beat_rec'][player_id]['force'] - 2;
        } else {
            if (player_id == 'player_1') {
                $scope.speed_up_p1 = 'Speed Up';
            } else {
                $scope.speed_up_p2 = 'Speed Up';
            }
            $scope.GAME_RECORD['current_beat_rec'][player_id]['speed_up'] = false;
            $scope.GAME_RECORD['current_beat_rec'][player_id]['force'] = $scope.GAME_RECORD['current_beat_rec'][player_id]['force'] + 2;
        }
    }
    $scope.speed_up = function (player_num) {
        player_id = 'player_' + player_num
        speed_up_func(player_id);
        force_power_check();
        log_it()
    };

    function power_up_func(player_id) {
        if ($scope.GAME_RECORD['current_beat_rec'][player_id]['power_up'] == false) {
            if (player_id == 'player_1') {
                $scope.power_up_p1 = '+2 Power';
            } else {
                $scope.power_up_p2 = '+2 Power';
            }
            $scope.GAME_RECORD['current_beat_rec'][player_id]['power_up'] = true;
            $scope.GAME_RECORD['current_beat_rec'][player_id]['force'] = $scope.GAME_RECORD['current_beat_rec'][player_id]['force'] - 2;
        } else {
            if (player_id == 'player_1') {
                $scope.power_up_p1 = 'Power Up';
            } else {
                $scope.power_up_p2 = 'Power Up';
            }
            $scope.GAME_RECORD['current_beat_rec'][player_id]['power_up'] = false;
            $scope.GAME_RECORD['current_beat_rec'][player_id]['force'] = $scope.GAME_RECORD['current_beat_rec'][player_id]['force'] + 2;
        }
    }
    $scope.power_up = function (player_num) {
        player_id = 'player_' + player_num
        power_up_func(player_id);
        force_power_check();
        log_it()
    };

    function defense_up_func(player_id) {
        if ($scope.GAME_RECORD['current_beat_rec'][player_id]['defense_up'] == false) {
            if (player_id == 'player_1') {
                $scope.defense_up_p1 = '+2 Defense';
            } else {
                $scope.defense_up_p2 = '+2 Defense';
            }
            $scope.GAME_RECORD['current_beat_rec'][player_id]['defense_up'] = true;
            $scope.GAME_RECORD['current_beat_rec'][player_id]['force'] = $scope.GAME_RECORD['current_beat_rec'][player_id]['force'] - 2;
        } else {
            if (player_id == 'player_1') {
                $scope.defense_up_p1 = 'Defense Up';
            } else {
                $scope.defense_up_p2 = 'Defense Up';
            }
            $scope.GAME_RECORD['current_beat_rec'][player_id]['defense_up'] = false;
            $scope.GAME_RECORD['current_beat_rec'][player_id]['force'] = $scope.GAME_RECORD['current_beat_rec'][player_id]['force'] + 2;
        }
    }
    $scope.defense_up = function (player_num) {
        player_id = 'player_' + player_num
        defense_up_func(player_id);
        force_power_check();
        log_it()
    };

    function ult_func(player_id) {
        $scope.GAME_RECORD['current_beat_rec'][player_id]['force'] = $scope.GAME_RECORD['current_beat_rec'][player_id]['force'] - $scope.GAME_RECORD['current_beat_rec'][player_id]['life'];

        if (player_id == 'player_1') {
            $scope.GAME_RECORD.player_1_alt_used = true;
        } else {
            $scope.GAME_RECORD.player_2_alt_used = true;
        }
    }

    $scope.ult = function (player_num) {
        player_id = 'player_' + player_num
        ult_func(player_id);
        force_power_check();
        log_it()
    };

    $scope.reset_btn = function () {
        localStorage.removeItem('battlecon_tools');
        set_up_game()
        check_for_saved_game();
        log_it()
        force_power_check();
    };

    $scope.sayHi = function() {
        alert('hi!')};
    

    function force_power_check() {
        $scope.speed_up_p1_dis = ($scope.GAME_RECORD['current_beat_rec']['player_1']['force'] < 2 && $scope.GAME_RECORD['current_beat_rec']['player_1']['speed_up'] == false);
        $scope.speed_up_p2_dis = ($scope.GAME_RECORD['current_beat_rec']['player_2']['force'] < 2 && $scope.GAME_RECORD['current_beat_rec']['player_2']['speed_up'] == false);

        $scope.power_up_p1_dis = ($scope.GAME_RECORD['current_beat_rec']['player_1']['force'] < 2 && $scope.GAME_RECORD['current_beat_rec']['player_1']['power_up'] == false);
        $scope.power_up_p2_dis = ($scope.GAME_RECORD['current_beat_rec']['player_2']['force'] < 2 && $scope.GAME_RECORD['current_beat_rec']['player_2']['power_up'] == false);

        $scope.defense_up_p1_dis = ($scope.GAME_RECORD['current_beat_rec']['player_1']['force'] < 2 && $scope.GAME_RECORD['current_beat_rec']['player_1']['defense_up'] == false);
        $scope.defense_up_p2_dis = ($scope.GAME_RECORD['current_beat_rec']['player_2']['force'] < 2 && $scope.GAME_RECORD['current_beat_rec']['player_2']['defense_up'] == false);

        $scope.extra_force_p1_dis = !$scope.GAME_RECORD.player_1_alt_used;
        $scope.extra_force_p2_dis = !$scope.GAME_RECORD.player_2_alt_used;

        if (($scope.GAME_RECORD['current_beat_rec']['player_1']['force'] >= $scope.GAME_RECORD['current_beat_rec']['player_1']['life']) && $scope.GAME_RECORD.player_1_alt_used == false) {
            $scope.ult_p1_dis = false
        } else {
            $scope.ult_p1_dis = true
        }
        if (($scope.GAME_RECORD['current_beat_rec']['player_2']['force'] >= $scope.GAME_RECORD['current_beat_rec']['player_2']['life']) && !$scope.GAME_RECORD.player_2_alt_used) {
            $scope.ult_p2_dis = false
        } else {
            $scope.ult_p2_dis = true
        }
    }


    set_up_game()
    check_for_saved_game();
    log_it()
    force_power_check();
});


