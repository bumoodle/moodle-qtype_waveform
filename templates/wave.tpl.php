<?php 

//start the individual wave and display its name
echo '<div class="wavecontainer editable'.($hidden ? ' redundant' : '').'" id="'.$name.'_div" name="'.$name.'_div">';
echo '<!-- '.$name. '-->';

if($dynamic_edit)
	echo '<div class="wavename'.($hide_name ? ' redundant' : '').'"><input class="wavename dynamicName" value="'.htmlentities($label).'"></div>';
else
	//echo '<div class="wavename'.($hide_name ? ' redundant' : '').'">'.$label.'<input type="hidden" name="'.$name.'" id="'.$name.'"></div>';
	echo '<div class="wavename'.($hide_name ? ' redundant' : '').'">'.$label.'</div>';
	

//create all timedivisions for the given duration
for($i=0; $i < $maxDuration; $i++)
{

	//if the given time-division has an initial value, use it
	if(array_key_exists($i, $initial_values))
		$classes = $initial_values[$i];
	else
		$classes = 'autoone';
		
		//if the given time-division has an initial value, use it
	if(array_key_exists($i, $extra_classes))
		$classes .= ' '.$extra_classes[$i];

	//display the actual time division
	echo '	<div class="wavecell '.$classes.'">'."\n";
	echo '		<div class="jointbottom"><span></span></div>'."\n";
	echo '		<div class="jointtop"><span></span></div>'."\n";
	echo '		<div class="jointmiddle"><span></span></div>'."\n";
	echo '  	<div class="timerule"><span></span></div>'."\n";
	echo '	</div>'."\n";
}

echo '</div>';



?>


