export class PreferencesContentMapping{

    constructor(){}

    static get keyWordsOnHeaderMapping():object {
        return {
            'ip alias' : "IP Aliases" ,
            'agentsub' : "Agent subscriptions",
            'advanced' : "Advanced Settings",
            'system overview' : "System Overview",
            'user settings' : 'User Settings',
            'auth token' : 'API authentication tokens',
            'hepsub' : "HEPSub",
        }
    };


    static get keyWordsOnPreferencesMapping():object {
        return {
            'ip alias' :'IP ALIASES',
            'agentsub' :  'AGENT SUBSCRIPTIONS',
            'advanced' :'ADVANCED SETTINGS',
            'auth token' :'API AUTH',
        }
    };

}