// Choose the rgb colors for the dot displayed for each domain
// If your site makes money, add the display_money attribute, and give it a label
var CONFIG = {
    'default': {
        "color": [168,168,168]
    },
    'some-non-money-making-site.com': {
        "color" : [30,51,87]
    },
    'another-site.com': {
        "color": [56,52,28]
    },
    'money-maker.com': {
        "display_money": true,
        "label": "MoneyMaker",
        "color" : [255,136,0]
    },
    'another-money-maker.com': {
        "display_money": true,
        "label": "Another Money Maker",
        "color" : [0,155,231]
    },
};
