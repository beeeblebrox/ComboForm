<?php

$method = $_SERVER['REQUEST_METHOD'];

// Fields
$email     = $_POST['Email'];

// Subjects
$subject_admin  = 'Заявка с сайта';

// Messages

foreach ( $_POST as $key => $value ) {
  if ( $value != "" ) {
    $message_admin .= '<tr><td>'. $key .':</td><td>' . $value . '</td></tr>';
  }
}
  
$message_admin  = '
<!--[if (gte mso 9)|(IE)]>
<table width="600" align="center"><tr><td style="padding-top:0; padding-bottom:0; padding-right:0; padding-left:0; margin:0px;">
<![endif]-->
<table align="center" cellspacing="0" cellpadding="5" border="2" bordercolor="#a8a8a8" style="width: 100%; max-width: 600px;">' . $message_admin . '
</table>
<!--[if (gte mso 9)|(IE)]>
</td></tr></table><![endif]-->
';

//

//SMTP

$config['smtp_username'] = 'name@yandex.ru'; //Ваш email
$config['smtp_port'] = '465';
$config['smtp_host'] =  'ssl://smtp.yandex.ru';
$config['smtp_password'] = '123456789'; //Пароль от почты
$config['smtp_debug'] = false;  //Если Вы хотите видеть сообщения ошибок, укажите true вместо false
$config['smtp_charset'] = 'utf-8';
$config['smtp_from'] = 'name@yandex.ru'; //Ваш email 


function smtpmail($to='', $mail_to, $subject, $message, $headers='') {
	global $config;
	$SEND =	"Date: ".date("D, d M Y H:i:s") . " UT\r\n";
	$SEND .= 'Subject: =?'.$config['smtp_charset'].'?B?'.base64_encode($subject)."=?=\r\n";
	if ($headers) $SEND .= $headers."\r\n\r\n";
	else
	{
			$SEND .= "Reply-To: ".$config['smtp_username']."\r\n";
			$SEND .= "To: \"=?".$config['smtp_charset']."?B?".base64_encode($to)."=?=\" <$mail_to>\r\n";
			$SEND .= "MIME-Version: 1.0\r\n";
			$SEND .= "Content-Type: text/html; charset=\"".$config['smtp_charset']."\"\r\n";
			$SEND .= "Content-Transfer-Encoding: 8bit\r\n";
			$SEND .= "From: \"=?".$config['smtp_charset']."?B?".base64_encode($config['smtp_from'])."=?=\" <".$config['smtp_username'].">\r\n";
			$SEND .= "X-Priority: 3\r\n\r\n";
	}
	$SEND .=  $message."\r\n";
	 if( !$socket = fsockopen($config['smtp_host'], $config['smtp_port'], $errno, $errstr, 30) ) {
		if ($config['smtp_debug']) echo $errno."<br>".$errstr;
		return false;
	 }

	if (!server_parse($socket, "220", __LINE__)) return false;

	fputs($socket, "HELO " . $config['smtp_host'] . "\r\n");
	if (!server_parse($socket, "250", __LINE__)) {
		if ($config['smtp_debug']) echo '<p>Не могу отправить HELO!</p>';
		fclose($socket);
		return false;
	}
	fputs($socket, "AUTH LOGIN\r\n");
	if (!server_parse($socket, "334", __LINE__)) {
		if ($config['smtp_debug']) echo '<p>Не могу найти ответ на запрос авторизации.</p>';
		fclose($socket);
		return false;
	}
	fputs($socket, base64_encode($config['smtp_username']) . "\r\n");
	if (!server_parse($socket, "334", __LINE__)) {
		if ($config['smtp_debug']) echo '<p>Логин авторизации не был принят сервером!</p>';
		fclose($socket);
		return false;
	}
	fputs($socket, base64_encode($config['smtp_password']) . "\r\n");
	if (!server_parse($socket, "235", __LINE__)) {
		if ($config['smtp_debug']) echo '<p>Пароль не был принят сервером как верный! Ошибка авторизации!</p>';
		fclose($socket);
		return false;
	}
	fputs($socket, "MAIL FROM: <".$config['smtp_username'].">\r\n");
	if (!server_parse($socket, "250", __LINE__)) {
		if ($config['smtp_debug']) echo '<p>Не могу отправить комманду MAIL FROM: </p>';
		fclose($socket);
		return false;
	}
	fputs($socket, "RCPT TO: <" . $mail_to . ">\r\n");

	if (!server_parse($socket, "250", __LINE__)) {
		if ($config['smtp_debug']) echo '<p>Не могу отправить комманду RCPT TO: </p>';
		fclose($socket);
		return false;
	}
	fputs($socket, "DATA\r\n");

	if (!server_parse($socket, "354", __LINE__)) {
		if ($config['smtp_debug']) echo '<p>Не могу отправить комманду DATA</p>';
		fclose($socket);
		return false;
	}
	fputs($socket, $SEND."\r\n.\r\n");

	if (!server_parse($socket, "250", __LINE__)) {
		if ($config['smtp_debug']) echo '<p>Не смог отправить тело письма. Письмо не было отправленно!</p>';
		fclose($socket);
		return false;
	}
	fputs($socket, "QUIT\r\n");
	fclose($socket);
	return TRUE;
}

function server_parse($socket, $response, $line = __LINE__) {
	global $config;
	while (@substr($server_response, 3, 1) != ' ') {
		if (!($server_response = fgets($socket, 256))) {
			if ($config['smtp_debug']) echo "<p>Проблемы с отправкой почты!</p>$response<br>$line<br>";
 			return false;
 		}
	}
	if (!(substr($server_response, 0, 3) == $response)) {
		if ($config['smtp_debug']) echo "<p>Проблемы с отправкой почты!</p>$response<br>$line<br>";
		return false;
	}
	return true;
}

//Отправка письма админу
smtpmail($admin_name, $config['smtp_username'], $subject_admin, $message_admin, false);

