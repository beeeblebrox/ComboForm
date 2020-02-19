<?php
// Файлы phpmailer
require 'class.phpmailer.php';
require 'class.smtp.php';

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

function sendMessage ($to, $subj, $message){ // Тема, сообщение



  $mail = new PHPMailer;
  $mail->CharSet = 'UTF-8';
  $mail->isSMTP();
  $mail->Host = 'smtp.yandex.ru'; // smtp.mail.ru для Mail.ru 
  $mail->SMTPAuth = true;
  $mail->Username = 'name'; // Логин в Яндексе/Mail (без @ и домена)
  $mail->Password = '123456789'; // Пароль
  $mail->SMTPSecure = 'ssl';
  $mail->Port = 465;
  $mail->setFrom('name@yandex.ru'); // Ваш Email
  $mail->addAddress($to); // Email получателя

  for ($ct = 0; $ct < count($_FILES['userfile']['tmp_name']); $ct++) {
    $uploadfile = tempnam(sys_get_temp_dir(), sha1($_FILES['userfile']['name'][$ct]));
    $filename = $_FILES['userfile']['name'][$ct];
    if (move_uploaded_file($_FILES['userfile']['tmp_name'][$ct], $uploadfile)) {
      $mail->addAttachment($uploadfile, $filename);
    } else {
      $msg .= 'Failed to move file to ' . $uploadfile;
    }
  }

  $mail->isHTML(true);
  $mail->Subject = $subj;
  $mail->Body    = $message;

  // Результат
  if(!$mail->send()) {
    echo 'Message could not be sent.';
    echo 'Mailer Error: ' . $mail->ErrorInfo;
  } else {
    echo 'ok';
  }
}

//Вызов функции отправки сообщений. Можно добавлять новых адресатов, если нужно. 
sendMessage('name@yandex.ru', $subject_admin, $message_admin); // Админу
