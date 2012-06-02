
<form method="POST">

<?php

function __autoload($class_name) 
{
    include $class_name . '.class.php';
}

if(!isset($_POST['a']) || !isset($_POST['b']) || !isset($_POST['x']) || !isset($_POST['mode']))
{
	$_POST['a'] = $_POST['b'] = $_POST['x'] = array();
	$_POST['mode'] = "Test These Values As Instructor";
}
	   

$waveform = new LogicWaveform(40, $_POST['mode']=="Test These Values As Instructor");
$waveform->add_wave('a', 'A', $_POST['a']);
$waveform->add_wave('b', 'B', $_POST['b']);
$waveform->add_wave('x', 'X', $_POST['x']);
$waveform->render();

?>

<input type="submit" name="mode" value="Test These Values As Student">
<input type="submit" name="mode" value="Test These Values As Instructor">
</form>