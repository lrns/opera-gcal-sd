var dateFormat = {
 'time' : '',
 'day' : 'MM/dd (E)',
 'sd-title' : 'yyyy, NNN d EE H:mm',
 'months-short' : new Array('1月', '2月', '3月', '4月', '5月', '6月', 
 '7月', '8月', '9月', '10月', '11月', '12月'),
 'months' : new Array('睦月', '如月', '弥生', '卯月', '皐月', '水無月', 
 '文月', '葉月', '長月', '神無月', '霜月', '師走'),
 'weekdays-short' : new Array('日', '月', '火', '水', '木', '金', '土'),
 'weekdays' : new Array('日曜', '月曜', '火曜', '水曜', '木曜', '金曜', '土曜')
}

var text = {
 'index-title' : 'Googleカレンダー',
 'options-title' : '設定',

 'refresh-cal' : 'カレンダーを更新',
 'options-account' : 'アカウント',
 'options-share-session' : 'ブラウザのセッションと共有',
 'options-separate-signin' : '別のGoogleアカウントでサインイン:',
 'options-email' : 'Email',
 'options-password' : 'Password',
 'signin' : 'サインイン',
 'signout' : 'サインアウト',
 'options-signed' : 'Googleアカウントでサインイン中:',
 'options-user-email' : 'Email:',

 'options-options' : 'オプション',
 'options-1-min' : '1分',
 'options-5-min' : '5分',
 'options-10-min' : '10分',
 'options-15-min' : '15分',
 'options-30-min' : '30分',
 'options-1-h' : '1時間',
 'options-5-h' : '5時間',

 'options-refresh-interval' : '更新間隔',
 'options-auto' : '自動',
 'options-time-zone' : 'タイムゾーン',
 'options-default-cal' : 'デフォルトの',
 'options-own-cals' : 'マイ',
 'options-all-cals' : 'すべての',
 'options-selected-cals' : '選択した',
 'options-calendars' : 'カレンダー',
 'options-all-cal-note' : '*空のカレンダーは表示されません.',
 'options-cals-to-use' : '利用するカレンダー',
 'options-appearance' : '表示',
 'options-bg-color' : '背景色',
 'options-font-color' : 'フォントの色',
 'options-alt-font-color' : 'フォントの代替色 (終日予定用)',
 'options-mx-entries' : '最大表示数',
 'options-past-events' : '本日の予定を全表示 (過ぎた予定も表示する)',
 'options-end-time' : '終了時間を表示',
 'options-date-format' : '日付の表示形式, <a target="_blank" href="http://www.javascripttoolbox.com/lib/date/documentation.php">凡例</a>を参照',
 'options-title-date' : 'スピードダイヤルのタイトルでの日付表示形式, <a target="_blank" href="http://www.javascripttoolbox.com/lib/date/documentation.php">凡例</a>を参照。ただしNNN→1月、MMM→睦月',
 'options-font-size' : 'フォントサイズ: ',
 'options-font-px' : 'pixels',
 'options-wrap-lines' : 'タイトルを折り返す',
 'options-reset-prefs' : '設定を初期化',
 'options-footer' : 'Googleサーバーとのすべての接続はHTTPSプロトコルを通じて行われます。パスワードはどこにも保存されることなく、最初のサインインにのみ使用されます。',

 'options-login' : 'ログイン',
 'options-error' : 'エラー: ',
 'options-signing-in' : 'サインイン中',

 'options-reset-confirm' : '設定を初期化してよろしいですか？',

 'view-unknown-error' : 'Unknown error!',
 'view-click-signin' : 'クリックしてサインインしてください',
 'view-signin-prefs' : 'Please sign in inside extension preferences',
 'view-no-events' : '予定はありません'

}
console.log('JAPAN loaded');
console.log(text['index-title']);
updateTranslation();

