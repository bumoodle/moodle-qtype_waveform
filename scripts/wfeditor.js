/**
 * Waveform Editor Support Script
 */

const KEY_CTRL = 17;
const KEY_ALT = 18;

var wfModUnknown = false;
var wfModDelete = false;
var wfModSelect = false;

var wfInitialValues = new Array();

var wfLastMod = null;

//selection variables
var wfSelectStart = null;
var wfSelectEnd = null;
var wfImplicitSelectStart = null;
var wfImplicitSelectEnd = null;
var wfSelectHintEnd = null;

/**
 * Returns true iff the given value has been determined automatically.
 * 
 * @param item A JQuery-wrapped object representing the given wavecell. 
 * @returns {Boolean} True iff the given value was determined automatically.
 */
function isAuto(item)
{
	return(item.hasClass('autoone') || item.hasClass('autozero') || item.hasClass('autounknown'));
}

/**
 * Returns true iff the given value was locked by the instructor.
 * 
 * @param item A JQuery-wrapped object representing the given wavecell. 
 * @returns {Boolean} True iff the given value was locked by the instructor.
 */
function isFixed(item)
{
	return(item.hasClass('fixedone') || item.hasClass('fixedzero') || item.hasClass('fixedunknown'));
}

/**
 * Returns the automatic-equivalent class for the given element.
 * 
 * @param item A JQuery-wrapped object representing the given wavecell. 	
 * @returns {String} The name of the automatic class which represents the same value as the input object.
 */
function autoEquivalent(item)
{
	if(item.hasClass('one')  || item.hasClass('autoone') || item.hasClass('fixedone'))
		return 'autoone';
	else if(item.hasClass('zero')  || item.hasClass('autozero')  || item.hasClass('fixedzero'))
		return 'autozero';
	else if(item.hasClass('unknown')  || item.hasClass('autounknown')  || item.hasClass('fixedunknown'))
		return 'autounknown';
	else 
		return '';
}

/**
 * Returns the equivalent core class for the given element.
 * 
 * @param item A JQuery-wrapped object representing the given wavecell. 	
 * @returns {String} The name of the core class which represents the same value as the input object.
 */
function coreClass(item)
{
	if(item.hasClass('one') || item.hasClass('autoone')  || item.hasClass('fixedone'))
		return 'one';
	else if(item.hasClass('zero')  || item.hasClass('autozero')  || item.hasClass('fixedzero'))
		return 'zero';
	else if(item.hasClass('unknown')  || item.hasClass('autounknown')  || item.hasClass('fixedunknown'))
		return 'unknown';
	else 
		return '';
}


/**
 * Toggles the value of a given wavecell.
 * @param timediv A JQuery-wrapped object representing the given wavecell.
 */
function toggleValue(timediv)
{
		
	if(logicValue(timediv)==1)
	{
		stripValueClass(timediv);
		timediv.addClass('zero');
	}
	else
	{
		stripValueClass(timediv);
		timediv.addClass('one');
	} 
}

/**
 * Retrieves the i-th child of the given container.
 * @param item The container to retrieve the child from.
 * @param i The index of the child to return.
 */
function getChild(item, i)
{
	//return item.children(':visible').filter(':nth-child(' + i + ')');
	return item.children(':nth-child(' + i + ')');
}

/**
 * Remove the transition from a given wavecell, if present (vertical bars between adjacent cells).
 * @param item A JQuery-wrapped object representing the given wavecell. 
 */
function stripTransitions(item)
{
	item.removeClass('transition');
	item.removeClass('autotransition');
	item.removeClass('fixedtransition');
}

/**
 * Shrinks the calling cell, if it above a certain size.
 * 
 * @param threshold 	If positive, the minimum width the wavecell must be to be shrunk; if negative
 * 						then its absolute value represents the maximum width the wavecell must be.  
 * @param shrinkBy		The amount to shrink by; can be negative to "grow" the cell instead.
 */
function shrinkCell(threshold, shrinkBy)
{
	var width = $(this).width();
	
	//if we exceed the threshold, shrink by the given amount
	if(width > threshold)
		$(this).width(width - shrinkBy);
}

/**
 * Grows a cell if it is less than a certain size.
 * 
 * @param threshold 	If positive, the maximum width the wavecell must be to be "grown"; if negative
 * 						then its absolute value represents the minimum width the wavecell must be.  
 * @param growBy		The amount to "grow" by; can be negative to shrink the cell instead.
 */
function growCell(threshold, growBy)
{
	var width = $(this).width();
	
	//if we exceed the threshold, grow by the given amount	
	if(width <= threshold)
		$(this).width(width + growBy);
}

/**
 * Simple function that determines if a given var is a simple number.
 */
function isNumeric(input)
{
    return (input - 0) == input && input.length > 0;
}

/**
 * Automatically resize the wavecells in a wavecontainer according to
 * the amount of wavecells desired.
 * 
 * @param container	
 * @param count
 */
function autoResize(container, count)
{
	if(!isNumeric(count))
		count = divisionCount(container);
	
	
	//handle shrinking, when applicable
	if(count > 45)
	{
		$('.wavecell').each(function() { shrinkCell.call(this, 12, 6); } );
		$('.wavecell').each(function() { shrinkCell.call(this, 9, 3); } );
	}
	if(count > 35)
	{
		$('.wavecell').each(function() { shrinkCell.call(this, 12, 3); } );
	}	
	
	//handle growing, when applicable
	if(count <= 45)
	{
		$('.wavecell').each(function() { growCell.call(this, 12, 6); } );
		$('.wavecell').each(function() { growCell.call(this, 9, 3); } );
	}
	if(count <= 35)
	{
		$('.wavecell').each(function() { growCell.call(this, 12, 3); } );
	}	
	
	
}


/**
 * Strip all automatic values from the given wavecell.
 * 
 * @param item A JQuery-wrapped object representing the given wavecell.
 */
function stripAutos(item)
{
	item.removeClass('autoone');
	item.removeClass('autozero');
	item.removeClass('autounknown');	
}


/**
 * Automatically insert transitions  (vertical border) whenever a value changes.
 * 
 * @param container The wavecontainer for the waveform in question.
 */
function updateTransitions(container)
{
	var i;
	
	//for each wave in the container (child 0 is the label)
	for(i = 2; i < childCount(container); ++i)
	{
		//get both the current and next child
		var child = getChild(container, i);
		var nextChild = getChild(container, i+1);
		
		//and add or remove a transition according to the difference
		if(logicValue(child)==logicValue(nextChild))
		{
			stripTransitions(nextChild);
			child.children('.timerule').show();
		}
		else if(isFixed(child) && isFixed(nextChild))
		{
			stripTransitions(nextChild);
			nextChild.addClass('fixedtransition');
			child.children('.timerule').hide();
		}
		else if(isAuto(child) || isAuto(nextChild))
		{
			stripTransitions(nextChild);
			nextChild.addClass('autotransition');
			child.children('.timerule').hide();
		}
		else
		{
			stripTransitions(nextChild);
			nextChild.addClass('transition');
			child.children('.timerule').hide();
		}
			
	}
	
	//hide the rightmost time rule
	container.children(':visible').filter(':last').children('.timerule').hide();
	
}

function locationIdentifier()
{
	
}

/**
 * Automatically determines intuitive values for all unspecified wavecells, facilitating input. 
 * 
 * @param container A jQuery-wrapped wavecontainer.
 */
function propogateAuto(container)
{
	var i = 1;

	//clear automatic cells until we hit a "solid" (user-specified item)
	while(i++ <= childCount(container) && isAuto(getChild(container, i)))
		{
			stripAutos(getChild(container, i));
			getChild(container, i).addClass('autoone');
		}
	
	var baseItem = getChild(container, i);
	
	//This simple routine propogates the last "solid" value until we hit a
	//new solid value; then repeats for that value.
	
	//for each of the remaining children
	for(; i <= childCount(container); ++i)
	{
		var currentItem = getChild(container, i);

		//if the current item is solid (not an automatic), 
		//it becomes the new base item
		if(!isAuto(currentItem))
		{
			baseItem = currentItem;
		}
		//otherwise, we have an automatic item; replace it with the base item
		else
		{
			//remove all automatic items from the current item
			stripAutos(currentItem);
			
			//and add the automatic item which corresponds to the base item
			currentItem.addClass(autoEquivalent(baseItem));
		}
	}
	
}

/**
 * Create a simple serialization of a given wave's state,
 * from which it can reconstructed.
 * 
 * @param container The jQuery-wrapped wavecontainer to be serialized.
 */
function serializeWave(container)
{
	return toFilteredString(container, shorthandText, ',');
}

/**
 * Reconstructs a given wave from the a serialized version of that wave.
 * 
 * @param container The jQuery-wrapped wavecontainer to be replaced. 
 * @param serialized The serialization of a wavecontainer to be interpreted.
 */
function unserializeWave(container, serialized)
{
	//split the serialization into an array of two-letter class comments
	var shorthand = serialized.split(",");
	
	//for each wavecell in the container
	for(i = 2; i <= childCount(container); ++i)
	{
		var child = getChild(container, i);
		
		//if no shorthand was provided for the given cell, 
		//skip it
		if(typeof shorthand[i - 2] === "undefined")
			continue;
		
		//skip fixed elements
		if(isFixed(child))
			continue;
		
		//remove the item's value
		stripValueClass(child);
		
		//and replace it with the correct class from the shorthand
		child.addClass(fromShorthand(shorthand[i - 2]));
	}
	
	//update the wave
	wfMaintenance(child);
}

function childCount(container)
{
	return container.children(':visible').length;	
}

/**
 * Convert the given waveform to a logic string, which can be used for value-based comparisons. 
 * 
 * @param container The jQuery-wrapped wavecontainer to be parsed.
 * @returns	A VHDL-syntax bitstring; e.g. "000100X0".
 */
function toLogicString(container)
{
	return toFilteredString(container, logicValue, '')
}

/**
 * Applies a given function to every element of a wavecell, and creates a string from the output.
 * 
 * @param container The jQuery-wrapped wavecontainer to be interpreted.
 * @param lambda A function which takes a wavecell, and returns some string representation of that wavecell.
 * @param cement A character, or set of characters, to be placed between each wavecell's lambda-output.
 * @returns
 */
function toFilteredString(container, lambda, cement)
{
	var buf = '';
	
	//for each wavecell, apply the lambda, and add the output to the buffer
	for(i = 2; i <= childCount(container); ++i)
		 buf += lambda(getChild(container, i)) + cement;
	
	//and return the buffer, minus the unneeded final cement piece
	return buf.substring(0, buf.length - cement.length);
}

/**
 * Adjusts the visibility of the joint symbols, which denote user-placed elements. 
 */
function updateJoints()
{
	$('.wavecell').each(displayItemJoints)
}


/**
 * Display the appropriate joint symbols for the given element.
 */
function displayItemJoints()
{
	//this substitution makes this a lot more readable
	child = $(this);
	
	
	//if the item is a user-placed 1, it gets a top joint
	if(child.hasClass('one'))
		child.children('.jointtop').show();
	else
		child.children('.jointtop').hide();
	
	//if the item is a user-placed 0, it gets a bottom joint
	if(child.hasClass('zero'))
		child.children('.jointbottom').show();
	else
		child.children('.jointbottom').hide();
	
	//if the item is a user-placed X/unknown, it gets a middle joint
	if(child.hasClass('unknown'))
		child.children('.jointmiddle').show();
	else
		child.children('.jointmiddle').hide();	
}

/**
 * Determines a logic value according to the waveform displayed.
 * 
 * @param timediv The div representing the given time division.
 * @returns 1 for high, 0 for low, 'X' for unknown
 */
function logicValue(timediv)
{
	if(typeof timediv == "undefined")
		return '';
	
	if(timediv.hasClass('autoone') || timediv.hasClass('one') || timediv.hasClass('fixedone'))
		return 1;
	else if(timediv.hasClass('autozero') || timediv.hasClass('zero') || timediv.hasClass('fixedzero'))
		return 0;
	else
		return 'X';
}

/**
 * Creates a shorthand representation of the given time division.
 * 
 * @returns a shorthand two-character code that indicates the logic value and entry type.
 * @param timediv The div representing the given time division. 
 */
function shorthandText(timediv)
{
	//assume user entry by default
	var prefix = 'u';
	
	//retrieve the logic value for the item
	var value = logicValue(timediv); 
	
	if(timediv.hasClass('autoone') || timediv.hasClass('autozero') || timediv.hasClass('autounknown'))
		prefix = 'a';
	else if (timediv.hasClass('fixedone') || timediv.hasClass('fixedzero') || timediv.hasClass('fixedunknown'))
		prefix = 'f';
	
	//shorthand = single letter prefix, VHDL-syntax bit value
	return prefix + value;
}

/**
 * Converts a serialization shorthand into a full CSS class name.
 * 
 * @param shorthand The given piece of serialization shorthand.
 * @returns {String} The class name, which, when applied, will display the correct value.
 */
function fromShorthand(shorthand)
{
	var prefix = '';
	var suffix = '';
	
	switch(shorthand.charAt(0))
	{
		case 'a':
			prefix = 'auto';
			break;
		
		case 'f':
			prefix = 'fixed';
			break;
	
	}

	switch(shorthand.charAt(1))
	{
		case '0':
			suffix = "zero";
			break;
		case '1':
			suffix = "one";
			break;
		case 'X':
			suffix ="unknown";
			break;
	}	
	
	return prefix + suffix;
}



/**
 * Force a given wavecell to have the "unknown" value.
 * 
 * @param item The JQuery object for the wavecell.
 */
function forceUnknown(item)
{
	stripValueClass(item);
	item.addClass('unknown');
}


/**
 * Remove the wavecell's value.
 * 
 * @param item The JQuery object for the wavecell.
 */
function stripValueClass(item)
{
	item.removeClass(autoEquivalent(item));
	item.removeClass(coreClass(item));
}

/**
 * Remove a given point from the waveform.
 * 
 * @param item The JQuery wavecell object. 
 */
function unsetValue(item)
{
	unsetValueNoUpdate(item);
	
	//and update the waveform
	wfMaintenance(item);
}

function unsetValueNoUpdate(item)
{
	if(isFixed(item))
		return;
	
	//replace the object's value with an automatic one
	stripValueClass(item);
	item.addClass('autoone');
}

/**
 * Upkeeps the waveform to ensure a consistent state. 
 * Should be called each time the waveform is modified
 * @param item
 */
function wfMaintenance(item)
{
	//automatically adjust automatic ("unpinned") waveform components
	propogateAuto(item.parent());
	
	//ensure the vertical transition bar is present when the value changes
	updateTransitions(item.parent());
	
	//and display the "pushpin" style joints that show the user they've "fixed" a given point
	updateJoints();		
	
	//save the current waveset
	saveWaveset(parentWaveset(item));
}

/**
 * Cancels all modifier buttons.
 */
function cancelAllMods()
{
	wfModUnknown = false;
	wfModDelete = false;
	wfModSelect = false;
	
	//cancel the selection tool
	cancelSelect();
	
	$('.modUnknown, .modDelete, .modNormal, .modSelect').removeClass('wfHighlighted');
	
	
}

/**
 * Get the waveset which contains the given item. 
 */
function parentWaveset(item)
{
	return item.parents(".wfQuickform");
}

/**
 * Handles click-event for the Force Uknown modifier button.
 */
function modUnknownClick()
{
	cancelAllMods();
	wfModUnknown = true;
	
	$('.modUnknown').addClass('wfHighlighted');
}

/**
 * Handles click-event for the Delete modifier button.
 */
function modDeleteClick()
{
	cancelAllMods();
	wfModDelete = true;
	
	$('.modDelete').addClass('wfHighlighted');
}

/**
 * Resets every waveform on the page to its original state.
 * TODO: replace with master container?
 */
function resetAll()
{	
	//reset each of the waves in the _current_ waveset
	parentWaveset($(this)).children('.wavecontainer').each(function() { resetWave($(this)) });
}

/**
 * Resets a given waveform to its original state.
 * @param container
 * 
 */
function resetWave(container)
{
	var containerId = $('.wavecontainer').index(container);
	
	//if the wave has a stored initial value, restore it
	if(containerId in wfInitialValues)
		unserializeWave(container, wfInitialValues[containerId]);
	
	//otherwise, delete the wave
	else
	{
		//get an array of all time division in the given wave
		var timedivs = container.children('.wavecell:visible');
		
		if(timedivs.length > 0)
		{
			//clear each of the time divisions
			for(var i = 0; i < timedivs.length; ++i)
			{
				//do not clear fixed elements
				if(isFixed(timedivs[i]))
					continue;
				
				unsetValueNoUpdate(timedivs[i]);
				
			}
		
			//and mainatin the new wave
			wfMaintenance(timedivs[0]);
		}
	}
}



/*
 * EVENT HANDLERS
 */

function wfMouseUp(e)
{
	//don't allow implicit selecting while the hard selection tool is
	//being used (in instances which support the hard selection tool)
	if(wfModSelect)
	{
		cancelImplicitSelect();
		return;
	}
	
	//if we're not selecting, return
	if(wfImplicitSelectStart==null)
		return;
	
	
	//if we haven't traveled outside of the wavecell, this is a click, not a drag
	if(wfImplicitSelectStart.get(0) == $(this).get(0))
	{
		cancelImplicitSelect();
		return;
	}
		
	
	//if the mouse started and stopped over the same range
	if(wfImplicitSelectStart.parent().get(0) == $(this).parents('.wavecontainer').get(0))
	{
		wfSelectStart = wfImplicitSelectStart;
		
		wfSelectEnd = $(this);
		
		/*
		//if this is a wavecell, then it is the endpoint
		if($(this).hasClass('wavecell'))
		{
			wfSelectEnd = $(this);
		}
		//otherwise, if it's a wavename, we've dragged past the end to the left
		//and the correct endpoint is the leftmost cell
		else if ($(this).hasClass('wavename'))
		{
			wfSelectEnd = $(this).parents('.wavecontainer').children('.wavecell:visible:first');
		}
		//otherwise, if it's a Right Buffer, we've dragged past the end to the right
		//and the correct endpoint is the rightmost cell
		else if ($(this).hasClass('bufferRight'))
		{
			wfSelectEnd = $(this).parents('.wavecontainer').children('.wavecell:visible:last');
		}
		//otherwise, something's gone wrong
		else
		{
			return;
		}
		*/
			
		
		renderSelectHint(wfSelectStart, wfSelectEnd);
		showSelectBar();
	}
	
	wfImplicitSelectStart = null;
}

function wfMouseUpAndOut()
{
	if(wfSelectStart != null)
		return;
	
	if((wfImplicitSelectStart != null && wfImplicitSelectEnd == null))
		useSelectHintedRange();
		
}

function wfMouseDown(e)
{	
	if(!$(' #wfSelectbar').is(':visible'))
		wfImplicitSelectStart = $(this);
}

function wfMouseMove(e)
{
	if(wfImplicitSelectStart==null)
		return;
	
	//if the mouse started and stopped over the same range
	/*
	if(wfImplicitSelectStart.parent().get(0) == $(this).parent().get(0))
	{
		renderSelectHint(wfImplicitSelectStart, $(this), 'wfSelectedImplicit');
	}
	else
	{
		
		
	*/
	
		var timeIndex = getTimeIndex($(this));	
		renderSelectHint(wfImplicitSelectStart, getChild($(wfImplicitSelectStart.parent()), timeIndex), 'wfSelectedImplicit');
		
	//}
		
}


/**
 * Handle wavecell clicks.
 */
function wfClick(e)
{
	hideSelectBar();

	//don't allow changes to fixed blocks
	if(isFixed($(this)))
		return;

	if(wfModSelect)
    {
		handleSelect($(this));
    }
	
	//if the user has pressed the Unknown button, or is holding the Alt key, force unknown
	else if(wfModUnknown || e.altKey)
	{
		forceUnknown($(this));
		cancelSelect();
	}
	
	//if the user is holding CTRL, or has pressed the Delete button, unset the given value 
	else if(wfModDelete || e.ctrlKey)
	{
		unsetValue($(this));
		cancelSelect();
	}
	
	//otherwise, toggle
	else
	{
		toggleValue($(this));
		cancelSelect();
	}
	
	wfMaintenance($(this));
    e.stopImmediatePropagation();
    return false;
}

/**
 * Handles the "select" operation.
 */
function handleSelect(item)
{
	//two cases:
	//case 1: we're _not_ halfway through selecting
	if(wfSelectStart==null || wfSelectEnd != null)
	{
		$('#wfSelectbar').hide();
		
		wfSelectStart = item;
		wfSelectEnd = null;
		
		//indicate it was selected
		wfSelectStart.addClass('wfSelected');
	}
	else
	{
		//if the user has selected a different wave
		if(item.parent().get(0) !== wfSelectStart.parent().get(0))
		{
			cancelAllMods();
			return;
		}
		else
		{
			wfSelectEnd = item;
			
			showSelectBar();
		}
		
		
	}
}

/**
 * Show the select bar, for working with selections.
 */
function showSelectBar()
{
	var dir, opp, xoff;
	
	var pos = wfSelectEnd.position();
	var width = wfSelectEnd.width();
	
	
	const pad_x  = 5;
	const pad_y = 3;
	
	if(wfSelectEnd.position().left > wfSelectStart.position().left || wfSelectEnd.position().left < 250)
	{
		$('#wfSelectbar').css('left', (pos.left + pad_x + width) + 'px');
	}
	else
	{
		var selectWidth = $('#wfSelectbar').width();
		$('#wfSelectbar').css('left', (pos.left - pad_x - width - selectWidth) + 'px');
	}
	
	//show the select bar, close to the mouse

	$('#wfSelectbar').css('top', (pos.top + pad_y) + "px");
	$('#wfSelectbar').slideDown(100);	
}

/**
 * Hide the selectbar.
 */
function hideSelectBar()
{
	$('#wfSelectbar').slideUp('fast');
}

/**
 * Executes a given lambda for each of the selected items.
 */
function eachSelected(lambda, lambdaFirst, lambdaLast)
{
	//for readabilitycancelAllMod
	var start = wfSelectStart;
	var end = wfSelectEnd;
	
	//ensure we have a start/end
	if(start==null || end == null)
		return false;
	
	//ensure that the selection is valid
	if(start.parent().get(0) != end.parent().get(0))
		return false;

	//compute the left/right bounds for the item
	var left = Math.min(getTimeIndex(start), getTimeIndex(end));
	var right = Math.max(getTimeIndex(start), getTimeIndex(end));
	var container = start.parent();

	//apply the lambda to each of the items
	for(var i = left; i <= right; ++i)
		lambda(getChild(container, i));
	
	//apply special lambdas for the first and last elements, if provided
	if(typeof lambdaFirst != "undefined")
		lambdaFirst(getChild(container, left));
	if(typeof lambdaLast != "undefined")
		lambdaFirst(getChild(container, right));
	
	//for convenience, maintain the wave
	wfMaintenance(start);
	return true;
}

/**
 * Returns the leftmost point of the given selection. 
 */
function selectionStart()
{
	if(getTimeIndex(wfSelectStart) <  getTimeIndex(wfSelectEnd))
		return wfSelectStart;
	else
		return wfSelectEnd;
}

/**
 * Saves an entire waveset into a single HTML input.
 * @param waveset
 */
function saveWaveset(waveset)
{
	waveset.children('input').val(serialize_array(serializeWaveset(waveset)));
}


function serializeWaveset(waveset)
{
	var all_waves = waveset.children('.wavecontainer:visible');
	var wave_array = new Array();

	//for each wave in the given waveset
	for(var i = 0; i < all_waves.length; ++i)
	{
			//get a jQuery-wrapped object for the given wave
			var wave = $(all_waves[i]);

			//if the object is the dynamic base, skip it
			/*
			if(all_waves[i]==dynamicBase.get(0))
				continue;
			*/
			
			//and create a simple serialization of the wave
			wave_array.push(waveName(wave) + '|' + serializeWave(wave));
	}
	
	return wave_array;
}



function waveName()
{
	return '';
}

/**
 * Serializes simple arrays so they can be interpreted by PHP.
 * Cannot accept arrays with serialization characters; they must be escaped first.
 * 
 * @author  http://code.activestate.com/recipes/414334/
 * 
 * @param a			An array, which should contain simple strings. 
 * @returns {String}	A simple serialization of an array in such a form that PHP can interpret it.
 */
function serialize_array(a)
{
	var a_php = "";
	var total = 0;
	
	//for each element in the array, convert it to a PHP serialization 
	for (var key in a)
	{
		++total;
		a_php += "s:" + String(key).length + ":\"" + String(key) + "\";s:" + String(a[key]).length + ":\"" + String(a[key]) + "\";";
	}
	
	a_php = "a:" + total + ":{" + a_php + "}";
	
	return a_php;
}


/**
 * Returns the rightmost point of the given selection. 
 */
function selectionEnd()
{
	if(getTimeIndex(wfSelectStart) >  getTimeIndex(wfSelectEnd))
		return wfSelectStart;
	else
		return wfSelectEnd;
}

function divisionCount()
{	
	return $('.wavecontainer:last').children(':visible').length - 1;
}


function setToolbarWidth(animate)
{
	//find the appropriate width for the toolbar with respect to the given waveforms
	var timediv = $(this).parent('.wfQuickform').children('.wavecontainer:last').find('.wavecell:visible:last');
	var width =  (timediv.offset().left + timediv.width()) - $(this).offset().left;
	
	//and place it there, animating, if requestd
	if(animate)
		$(this).animate({'width':  width + 'px'}, 'fast');
	else
		$(this).css('width',  width + 'px');
}

function alignAllToolbars(animate)
{
	$('.mainToolbar').each(function() { setToolbarWidth.call(this, animate) } );
}

/**
 * Convenience wrapper for eachSelected which cancels selection after completeion.
 */
function eachSelectedFinal(lambda, lambdaFirst, lambdaLast)
{
	if(eachSelected(lambda, lambdaFirst, lambdaLast))
		cancelAllMods();
}

function hintSelect(item)
{
	if(wfSelectStart != null && wfSelectEnd == null)
		renderSelectHint(wfSelectStart, item);		
}

function renderSelectHint(start, end, cssClass)
{
	if(typeof cssClass == "undefined")
		cssClass = 'wfSelected';
	
	//clear existing hints
	$('.wavecell').removeClass(cssClass);
	
	
	if(start.parent().get(0) != end.parent().get(0))
	{
		start.addClass(cssClass);
		return;
	}

	
	var left = Math.min(getTimeIndex(start), getTimeIndex(end));
	var right = Math.max(getTimeIndex(start), getTimeIndex(end));
	var container = start.parent();

	//highlight all of the given items
	for(var i = left; i <= right; ++i)
		getChild(container, i).addClass(cssClass);
	
	//store the item which _isn't_ already stored
	if(start == wfImplicitSelectStart ||  start == wfSelectStart)
		wfSelectHintEnd = end;
	else
		wfSelectEnd = start;
}

function useSelectHintedRange()
{
	//if we have no select start, the start may be an implicit start	
	if(wfSelectStart == null)
		wfSelectStart = wfImplicitSelectStart;
	
	//if this wasn't the case, then wfSelectStart will remain null,
	//and we can bail out with no harm done
	if(wfSelectStart == null)
		return;
	
	//clear any implicit values
	wfModSelect = false;
	wfImplicitSelectStart = null;
	wfImplicitSelectEnd = null;
	
	wfSelectEnd = wfSelectHintEnd;
	showSelectBar();
}

function cancelSelect()
{
	$('.wavecell').removeClass('wfSelected');
	$('.wavecell').removeClass('wfSelectedImplicit');
	wfSelectStart = wfSelectEnd = null;
	
	wfModSelect = false;
	
	$('#wfSelectbar').slideUp('fast');
	
	
}

/**
 * Displays the current time-bar on mouse over.
 */
function wfMouseIn()
{
	
	//get the time index the mouse is over
	//var timeIndex  = $(this).parent().children().index(this) + 1;
	
	//and display the time bar off all wave components at the given time 
	getChild($('.wavecontainer'), getTimeIndex($(this))).addClass('wfParallel');
	
	hintSelect($(this));

	if(wfModSelect)
		return;
	
	if(wfImplicitSelectStart!=null)
		if(wfImplicitSelectStart.parent().get(0) != $(this).parent().get(0))
			cancelImplicitSelect();
			
		
}

/**
 * Cancel implicit (drag) selection.
 */
function cancelImplicitSelect()
{
	wfImplicitSelectStart = null;
	$('.wavecell').removeClass('wfSelectedImplicit'); //TODO: wfImplicitSelected
}

/**
 * Hides the current time-bar on mouse out.
 */
function wfMouseOut()
{
	//get the time index the mouse was over, and remove the time bar 
	var timeIndex  = getTimeIndex($(this));
	getChild($('.wavecontainer'), timeIndex).removeClass('wfParallel');
}

function getTimeIndex(item)
{
	return item.parent().children(':visible').index(item) + 1;
}

/**
 * Handles the normal modifier button.
 */
function modNormalClick()
{
	//cancel all other modifiers, and highlight the normal button
	cancelAllMods();
	$('.modNormal').addClass('wfHighlighted');
}

function modSelectClick()
{
	cancelAllMods();

	wfModSelect= true;
	$('.modSelect').addClass('wfHighlighted');
}

/**
 * Handles general keypresses, providing type hints.
 * @param e The keyevent that occurred.
 */
function modKeyDown(e)
{
	
	//if another item was pressed, remove its highlight
	//TODO: chain these
	if(wfLastMod != null)
	{
		wfLastMod.removeClass('wfHighlighted');
		wfLastMod = null;
	}

	//note the current modifier key
	if(e.keyCode==KEY_CTRL) 
		wfLastMod = $('.modDelete');
	else if(e.keyCode==KEY_ALT)
		wfLastMod = $('.modUnknown');
	
	//highlight the appropriate modifier button for the key that's being pressed
	if(wfLastMod != null)
		wfLastMod.addClass('wfHighlighted');
}


/**
 * Handles general keypresses, providing type hints.
 * @param e Th)e keyevent that occurred.
 */
function modKeyUp(e)
{
	if(wfLastMod != null)
		wfLastMod.removeClass('wfHighlighted');
	
	wfLastMod = null;
}


/**
 * Force a given range to exhibit a specific value.
 * @param className
 */
function forceRange(className)
{	
	//TODO: query for any which are fixed instead
	if(isFixed(selectionStart()))
		return;

	//store the correct class for the endpoint
	var successor = selectionEnd().next();
	var successorClass;
	
	if(successor.length > 0)
		successorClass = coreClass(selectionEnd());
	
	//act as though we have just deleted the entire block
	eachSelected(unsetValueNoUpdate);
	
	//then, set the first element to the appropriate value
	stripValueClass(selectionStart());
	selectionStart().addClass(className);
	
	//if the end value would change
	//and set the last element to a user-set version
	//of what it was before
	if(successor.length > 0 && successorClass != coreClass(selectionStart()))
	{
		stripValueClass(successor)
		successor.addClass(successorClass);
	}

	//update the wave
	wfMaintenance(selectionStart());
	
	//cancell all modifiers
	cancelAllMods();
}

/**
 * Use the escape key to cancel mods and selections.
 */
function wfKeyUp(e)
{
	if(e.keyCode == 27)
	{
		cancelSelect();
		cancelImplicitSelect();
		cancelAllMods();
		
		$('.modNormal').click();
	}
}

function btnHelpClick(e)
{
	window.open('http://labs.ktemkin.com/moodle/help/wave_student.html');
}

/*
 * INITIALIZATION
 */

/**
 * Initialize the waveform applet.
 */
function wfInitialize()
{
	//handle mouse interactions for the wave-cells
	$('.wavecell').mouseover(wfMouseIn);
	$('.wavecell').children().mouseover(function() { $(this).parent().mouseover() });
	$('.wavecell').mouseout(wfMouseOut);
	$('.wavecell').mousedown(wfMouseDown);
	$('.wavecell').mouseup(wfMouseUp);
	$('.wavecell').mousemove(wfMouseMove);
	$('.wavecell').click(wfClick);

	//handle mouse interactions for off-left and off-right
	//(the edges of the wavecells)
	$(document).mouseup(wfMouseUpAndOut);
	
	//toolbar buttons
	$('.modNormal').click(modNormalClick);
	$('.modUnknown').click(modUnknownClick);
	$('.modDelete').click(modDeleteClick);
	$('.modSelect').click(modSelectClick);
	$('.btnReset').click(resetAll);
	$('.btnHelp').click(btnHelpClick);
	
	//selectbar (context bar for selections)
	$('#btnDelete').click(function() { eachSelectedFinal(unsetValueNoUpdate)});
	$('#btnUnknown').click(function() { forceRange('unknown') });
	$('#btnHigh').click(function() { forceRange('one') });
	$('#btnLow').click(function() { forceRange('zero') });
	$('#btnCancelSelect').click(cancelSelect);
	
	//handle keyboard shortcuts (except for modkeys)
	$(window).keyup(wfKeyUp);
	
	//show modkey effects
	$(window).keydown(modKeyDown);
	$(window).keyup(modKeyUp);
	
	//fix the transitions and display joints where possible on all wavecontainer
	$('.wavecontainer').each(function() { propogateAuto($(this))});
	$('.wavecontainer').each(function() { updateTransitions($(this))});
	$('.wavecontainer').each(function() { autoResize($(this), divisionCount()); } );
	$('.wfQuickform').each(function() { saveWaveset($(this)); })
	
	//thanks to IE, this should be done twice
	updateJoints();
	updateJoints();
	
	//take initial snapshots of each waveform (for reset)
	$('.wavecontainer').each(function() { wfInitialValues[$('.wavecontainer').index($(this))] = serializeWave($(this)); });
	
	//right align the toolbar
	alignAllToolbars();
}

//add the wfInitialize function to the list of actions to occur when the page is completely loaded
$("document").ready(wfInitialize);
