import type { ExtensionEntry } from './types';

export const extensionList: ExtensionEntry[] = [
  // ── 1-12: Original verified extensions (kept as-is) ──────────────
  {
    "id": "cjpalhdlnbpafiamejdnhcphjbkeiagm",
    "name": "uBlock Origin",
    "category": "ad-blocker",
    "warPath": "assets/icon-128.png",
    "installCount": 30000000,
    "silentProbe": { "type": "css", "target": "ad-slot" }
  },
  {
    "id": "gighmmpiobklfepjocnamgkkbigmacjg",
    "name": "AdBlock",
    "category": "ad-blocker",
    "warPath": "img/icon128.png",
    "installCount": 10000000,
    "silentProbe": { "type": "css", "target": "pub_300x250" }
  },
  {
    "id": "cfhdojbkjhnklbpkdaibdccddilifddb",
    "name": "Adblock Plus",
    "category": "ad-blocker",
    "warPath": "icons/icon128.png",
    "installCount": 10000000,
    "silentProbe": { "type": "css", "target": "ad_rect" }
  },
  {
    "id": "hdokiejnpimakedhajhdlcegeplioahd",
    "name": "LastPass",
    "category": "password-manager",
    "warPath": "images/icon128.png",
    "installCount": 10000000
  },
  {
    "id": "aeblfdkhhhdcdjpifigkomigojhajndp",
    "name": "1Password",
    "category": "password-manager",
    "warPath": "images/icon-128.png",
    "installCount": 3000000
  },
  {
    "id": "nngceckbapebfimnlniiiahkandclblb",
    "name": "Bitwarden",
    "category": "password-manager",
    "warPath": "images/icon128.png",
    "installCount": 4000000
  },
  {
    "id": "fmkadmapgofadopljbjfkapdkoienihi",
    "name": "React Developer Tools",
    "category": "dev-tools",
    "warPath": "build/icon-128.png",
    "installCount": 4000000,
    "silentProbe": { "type": "window", "target": "__REACT_DEVTOOLS_GLOBAL_HOOK__" }
  },
  {
    "id": "nhdogjmejiglipccpnnnanhbledajbpd",
    "name": "Vue.js devtools",
    "category": "dev-tools",
    "warPath": "icons/128.png",
    "installCount": 2000000,
    "silentProbe": { "type": "window", "target": "__VUE_DEVTOOLS_GLOBAL_HOOK__" }
  },
  {
    "id": "nkbihfbeogaeaoehlefnkodbefgpgknn",
    "name": "MetaMask",
    "category": "other",
    "warPath": "images/icon-128.png",
    "installCount": 10000000,
    "silentProbe": { "type": "window", "target": "ethereum" }
  },
  {
    "id": "kbfnbcaeplbcioakkpcpgfkobkghlhen",
    "name": "Grammarly",
    "category": "productivity",
    "warPath": "src/images/icon128.png",
    "installCount": 40000000
  },
  {
    "id": "bmnlcjabgnpnenekpadhaknfoignglpm",
    "name": "Honey",
    "category": "shopping",
    "warPath": "images/icon128.png",
    "installCount": 10000000
  },
  {
    "id": "majdfndcdelcgfpdfcpmbcccmedmcmik",
    "name": "NordVPN",
    "category": "vpn",
    "warPath": "assets/icons/icon-128.png",
    "installCount": 3000000
  },

  // ── 13+: Additional verified extensions ──────────────────────────
  {
    "id": "eimadpbcbfnmbkopoojfekhnkhdbieeh",
    "name": "Dark Reader",
    "category": "accessibility",
    "warPath": "ui/assets/images/icon-128.png",
    "installCount": 6000000
  },
  {
    "id": "dhdgffkkebhmkfjojejmpbldmpobfkfo",
    "name": "Tampermonkey",
    "category": "dev-tools",
    "warPath": "images/icon128.png",
    "installCount": 10000000
  },
  {
    "id": "lmhkpmbekcpmknklioeibfkpmmfibljd",
    "name": "Redux DevTools",
    "category": "dev-tools",
    "warPath": "img/icon128.png",
    "installCount": 3000000,
    "silentProbe": { "type": "window", "target": "__REDUX_DEVTOOLS_EXTENSION__" }
  },
  {
    "id": "mlomiejdfkolichcflejclcbmpeaniij",
    "name": "Ghostery",
    "category": "privacy",
    "warPath": "app/images/icon128.png",
    "installCount": 3000000
  },
  {
    "id": "pkehgijcmpdhfbdbbnkijodmdjhbjlgp",
    "name": "Privacy Badger",
    "category": "privacy",
    "warPath": "icons/badger-128.png",
    "installCount": 2000000
  },
  {
    "id": "bkdgflcldnnnapblkhphbgpggdiikppg",
    "name": "DuckDuckGo Privacy Essentials",
    "category": "privacy",
    "warPath": "img/icon_128.png",
    "installCount": 4000000
  },
  {
    "id": "bhlhnicpbhignbdhedgjhgdocnmhomnp",
    "name": "ColorZilla",
    "category": "dev-tools",
    "warPath": "images/icon-128.png",
    "installCount": 3000000
  },
  {
    "id": "gppongmhjkpfnbhagpmjfkannfbllamg",
    "name": "Wappalyzer",
    "category": "dev-tools",
    "warPath": "images/icon_128.png",
    "installCount": 2000000
  },
  {
    "id": "clngdbkpkpeebahjckkjfobafhncgmne",
    "name": "Stylus",
    "category": "dev-tools",
    "warPath": "images/icon/128.png",
    "installCount": 1000000
  },
  {
    "id": "dbepggeogbaibhgnhhndojpepiihcmeb",
    "name": "Vimium",
    "category": "productivity",
    "warPath": "icons/vimium-128.png",
    "installCount": 500000
  },
  {
    "id": "chlffgpmiacpedhhbkiomidkjlcfhogd",
    "name": "Pushbullet",
    "category": "productivity",
    "warPath": "icon_128.png",
    "installCount": 2000000
  },
  {
    "id": "niloccemoadcdkdjlinkgdfekeahmflj",
    "name": "Save to Pocket",
    "category": "productivity",
    "warPath": "images/icon-128.png",
    "installCount": 3000000
  },
  {
    "id": "bfogiafebfohielmmehodmfbbebbbpei",
    "name": "Keeper Password Manager",
    "category": "password-manager",
    "warPath": "icons/icon-128.png",
    "installCount": 1000000
  },
  {
    "id": "fdjamakpfbbddfjaooikfcpapjohcfmg",
    "name": "Dashlane",
    "category": "password-manager",
    "warPath": "images/icon128.png",
    "installCount": 3000000
  },
  {
    "id": "gpdjojdkbbmdfjfahjcgigfpmkopogic",
    "name": "Pinterest Save Button",
    "category": "social",
    "warPath": "images/icon128.png",
    "installCount": 10000000
  },
  {
    "id": "hlepfoohegkhhmjieoechaddaejaokhf",
    "name": "Refined GitHub",
    "category": "dev-tools",
    "warPath": "icon.png",
    "installCount": 500000
  },
  {
    "id": "hnmpcagpplmpfojmgmnngilcnanddlhb",
    "name": "Windscribe",
    "category": "vpn",
    "warPath": "images/icon-128.png",
    "installCount": 2000000
  },
  {
    "id": "oocalimimngaihdkbihfgmpkcpnmlaoa",
    "name": "Teleparty",
    "category": "social",
    "warPath": "images/icon128.png",
    "installCount": 10000000
  },
  {
    "id": "gcknhkkoolaabfmlnjonogaaifnjlfnp",
    "name": "FoxyProxy",
    "category": "vpn",
    "warPath": "images/icon-128.png",
    "installCount": 2000000
  },
  {
    "id": "liecbddmkiiihnedobmlmillhodjkdmb",
    "name": "Loom",
    "category": "productivity",
    "warPath": "img/loom-128.png",
    "installCount": 5000000
  },
  {
    "id": "chhjbpecpncaggjpdakmflnfcopglcmi",
    "name": "Rakuten",
    "category": "shopping",
    "warPath": "img/icon128.png",
    "installCount": 10000000
  },
  {
    "id": "fgddmllnllkalaagkghckoinaemmogpe",
    "name": "ExpressVPN",
    "category": "vpn",
    "warPath": "images/icon-128.png",
    "installCount": 2000000
  },
  {
    "id": "ailoabdmgclmfmhdagmlohpjlbpffblp",
    "name": "Surfshark VPN",
    "category": "vpn",
    "warPath": "icons/icon-128.png",
    "installCount": 2000000
  },
  {
    "id": "kgjfgplpablkjnlkjmjdecgdpfankdle",
    "name": "Zoom",
    "category": "productivity",
    "warPath": "images/icon.svg",
    "installCount": 10000000
  },
  {
    "id": "jlhmfgmfgeifomenelglieieghnjghma",
    "name": "Cisco Webex",
    "category": "productivity",
    "warPath": "images/icon128.png",
    "installCount": 10000000
  },
  {
    "id": "pioclpoplcdbaefihamjohnefbikjilc",
    "name": "Evernote Web Clipper",
    "category": "productivity",
    "warPath": "images/icon128.png",
    "installCount": 4000000
  },
  {
    "id": "knheggckgoiihginacbkhaalnibhilkk",
    "name": "Notion Web Clipper",
    "category": "productivity",
    "warPath": "images/icon-128.png",
    "installCount": 3000000
  },
  {
    "id": "jldhpllghnbhlbpcmnajkpdmadaolakh",
    "name": "Todoist",
    "category": "productivity",
    "warPath": "images/icon128.png",
    "installCount": 3000000
  },
  {
    "id": "chphlpgkkbolifaimnlloiipkdnihall",
    "name": "OneTab",
    "category": "productivity",
    "warPath": "images/icon128.png",
    "installCount": 3000000
  },
  {
    "id": "laookkfknpbbblfpciffpaejjkokdgca",
    "name": "Momentum",
    "category": "productivity",
    "warPath": "images/icon-128.png",
    "installCount": 3000000
  },
  {
    "id": "glnpjglilkicbckjpbgcfkogebgllemb",
    "name": "Okta Browser Plugin",
    "category": "password-manager",
    "warPath": "img/icon-128.png",
    "installCount": 5000000
  },
  {
    "id": "ienfalfjdbdpebioblfackkekamfmbnh",
    "name": "Angular DevTools",
    "category": "dev-tools",
    "warPath": "assets/icon-128.png",
    "installCount": 1000000,
    "silentProbe": { "type": "window", "target": "ng" }
  },
  {
    "id": "ddkjiahejlhfcafbddmgiahcphecmpfh",
    "name": "uBlock Origin Lite",
    "category": "ad-blocker",
    "warPath": "img/icon_128.png",
    "installCount": 3000000,
    "silentProbe": { "type": "css", "target": "ad-slot" }
  },
  {
    "id": "dapjbgnjinbpoindlpdmhochffioedbn",
    "name": "BuiltWith Technology Profiler",
    "category": "dev-tools",
    "warPath": "images/icon128.png",
    "installCount": 500000
  },
  {
    "id": "gomekmidlodglbbmalcneegieacbdmki",
    "name": "Avast Online Security & Privacy",
    "category": "privacy",
    "warPath": "common/images/icon128.png",
    "installCount": 10000000
  },
  {
    "id": "ihcjicgdanjaechkgeegckofjjedodee",
    "name": "Malwarebytes Browser Guard",
    "category": "privacy",
    "warPath": "icons/icon-128.png",
    "installCount": 5000000
  },
  {
    "id": "nenlahapcbofgnanklpelkaejcehkggg",
    "name": "Capital One Shopping",
    "category": "shopping",
    "warPath": "images/icon128.png",
    "installCount": 10000000
  },
  {
    "id": "mdanidgdpmkimeiiojknlnekblgmpdll",
    "name": "Boomerang for Gmail",
    "category": "productivity",
    "warPath": "images/icon128.png",
    "installCount": 1000000
  },
  {
    "id": "jabopobgcpjmedljpbcaablpmlmfcogm",
    "name": "WhatFont",
    "category": "dev-tools",
    "warPath": "icon128.png",
    "installCount": 1000000
  },
  {
    "id": "blipmdconlkpinefehnmjammfjpmpbjk",
    "name": "Lighthouse",
    "category": "dev-tools",
    "warPath": "images/icon-128.png",
    "installCount": 1000000
  },
  {
    "id": "oeopbcgkkoapgobdbedcemjljbihmemj",
    "name": "Checker Plus for Gmail",
    "category": "productivity",
    "warPath": "images/icon128.png",
    "installCount": 2000000
  },
  {
    "id": "mdjildafknihdffpkfmmpnpoiajfjnjd",
    "name": "Consent-O-Matic",
    "category": "privacy",
    "warPath": "icons/icon-128.png",
    "installCount": 500000
  },
  {
    "id": "gcbommkclmclpchllfjekcdonpmejbdp",
    "name": "HTTPS Everywhere",
    "category": "privacy",
    "warPath": "icons/icon-128.png",
    "installCount": 3000000
  }
];
