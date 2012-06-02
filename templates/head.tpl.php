<?php

	//core interactive JS scripts
	if($send_scripts)
	{
		echo '<script type="text/javascript" src="'.$include_path.'/scripts/jquery.js"></script>';
		echo '<script type="text/javascript" src="'.$include_path.'/scripts/wfeditor.js"></script>';
	}

	//add the Instructor extension if we're in  instructor mode 
	if($instructor_mode)
		echo '<script type="text/javascript" src="'.$include_path.'/scripts/wfeditor_instr.js"></script>';
		
	//add the dynamic edit extension, if appropriate
	if($dynamic_edit)
		echo '<script type="text/javascript" src="'.$include_path.'/scripts/wfeditor_dynamic.js"></script>';
	
	//and include the style sheets
	echo '<link rel="StyleSheet" href="'.$include_path.'/style/wfeditor.css" />';

	echo '<div class="wfQuickform'.($dynamic_edit ? ' wfDynamic' : '').'">';
?>
