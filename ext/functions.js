$(document).ready(function()
{
	////////////
	//var ref = document.referrer.replace(new RegExp('&','g'),';');
	var ref = rawurlencode (document.referrer);
	$.ajax({type: 'POST',url: "/ext/counter.php",cache:false, data: 'ref='+ref+'&res='+$(window).width()+'x'+$(window).height()});

	$('a[href^="http"]').bind('click', function()
		{
		  extrn_link($(this).attr('href'));
		}
	).each
	(
		function()
		{
			$(this).attr('target','_blank');
		}
	);
	////////////
	//
	// Плавна прокрутка до зазначеного hash
	// Об'єкт для збереження в ньому історії переходів, щоб користувач між за допомогою
	// браузера переміщатись назад вперед у межах однієї сторінки
	window.stateObj = { };
	
	$('.nav a[href*="#"]').click( function()
		{
			if(location.host == 'twbs-translate')
				return;
			
			var href = $(this).attr("href");
			
			// Якщо лінк веде не на поточну сторінку, то зупинити виконання цієї функції
			if( href.substr(0,1) != '#' && href.indexOf(window.location.pathname) == -1 )
				return;
			
			var hash = $(this).prop("hash");
			
			// Історія переходів для можливості в браузері перейти "Назад" чи "Веред"
			history.pushState(stateObj, hash, hash);
			
			scrollTo(hash);
			return false;
		}
	);
	//////////////////
});

// визначення TYPO_FOUND_CONF
var TYPO_FOUND_CONF =
{
	MAX_SELECTION_LENGTH: 127
	,TOO_LONG_SELECTION_MSG: "Ви вибрали занадто довгий текст"
	,THX_MESSAGE: 'Дякуємо за допомогу!'
	,AJAX_URL: '/ext/founderror.php'
};
var TypoFound =
{
	init: function()
	{
		var that = this;
		window.document.onkeypress = function(e)
		{
			if (that.checkEvent(e))
			{
				var str = new String( that.getSelection() ).toString();
				if(str.length > 0)
				if (str.length > TYPO_FOUND_CONF.MAX_SELECTION_LENGTH)
				{
					alert(TYPO_FOUND_CONF.TOO_LONG_SELECTION_MSG);
					return;
				}else
				{
					$.post(TYPO_FOUND_CONF.AJAX_URL,
						{
							str: str
							,url: window.location.href
						}
						,function(){alert(TYPO_FOUND_CONF.THX_MESSAGE)} // on success
					);
				}
				return false;
			}
		};
	}
	,getSelection: function()
	{
		try
		{
			return window.getSelection ?
			window.getSelection()
			: ( window.document.getSelection ?
			window.document.getSelection()
			: window.document.selection.createRange().text
			);
		} catch(e)
		{
			return null;
		}
	}
	,checkEvent: function(e)
	{
		return window.event ?
		(window.event.keyCode == 10 || (window.event.keyCode == 13 && window.event.ctrlKey))
		: ( e ?
		((e.which == 10 && e.modifiers == 2) || (e.keyCode == 0 && e.charCode == 106 && e.ctrlKey) || (e.keyCode == 13 && e.ctrlKey))
		: false
		);
	}
};
TypoFound.init();
// закінчення TypoFound

function extrn_link(url_par)
{
	//url_par = url_par.replace(new RegExp('&','g'),';');
	var url_par = rawurlencode (url_par);
	$.ajax({type: 'POST',url: "/ext/extrn_link.php",cache:false, data: 'r='+url_par});
}


/**
 * Функція для переходу до зазначеного селектора (hash)
 * 
 * @author Костя Третяк
 * @uses scrollJumpTo(), scrollSlowly()
 * @param string hash
 * @returns void
 */
function scrollTo(hash)
{
	// Якщо в якорі є двокрапка екранувати її,
	// бо вона сприймається за стан об'єкта
	hash = hash.replace(':', "\\:");
	
	// Визначення відстані до потрібного місця від верху
	var place = $(hash).offset().top;
	
	// Визначення відстані оглядового вікна від верху
	var scroll = $(window).scrollTop();
	
	// Визначення як за багато треба промотувати
	var restScroll = (place - scroll);
	
	// Визначення висоти оглядового вікна
	var screenHeight = $(window).height();
	
	// Поправка, яка чомусь командою twbs не виправляється (чи може в нас із ними різні браузери)
	if($(hash).attr("id") != $('h1' + hash).attr("id"))
					place = (place - 60);
	// Щоб плавно промотувати не більше, ніж на висоту одного екрана
	// порівнюється скільки треба промотувати до потрібного місця
	if((restScroll > screenHeight))
	{
		// Промотувати треба більше, ніж на висоту екрана,
		// і тому виконати спочатку стрибок до потрібного місця,
		// мінус висота екрана; після чого плавно перейти до кінця
		scrollJumpTo(place, screenHeight, hash);
	}
	else if(restScroll < -screenHeight)
	{
		scrollJumpTo(place, -screenHeight, hash);
	}
	else
	{
		// Місце призначення знаходиться близько, і тому стрибати не треба;
		// підійти плавно до нього.
		scrollSlowly(place, hash);
	}
}

/**
 * Функція для стрибка до місця призначення (place)
 * 
 * @author Костя Третяк
 * @uses scrollSlowly()
 * @param float place
 * @param float screenHeight
 * @param string hash
 * @returns void
 */
function scrollJumpTo(place, screenHeight, hash)
{
	var done = false;
	 $('html, body').animate({scrollTop: (place - (0.5*screenHeight))}, 1,
		function()
		{
			//  ! done використовується для одноразового запуску цієї функції
			if( ! done)
			{
				scrollSlowly(place, hash);
			}
			
			done = true;
		}
	);
}

/**
 * Функція для плавного переходу до потрібного місця (place)
 * 
 * @author Костя Третяк
 * @param float place
 * @param string hash
 * @returns void
 */
function scrollSlowly(place, hash)
{
	var done = false;
	$('html, body').animate({scrollTop: place}, 500,
		function()
		{
			//  ! done використовується для одноразового запуску цієї функції
			if( ! done)
			{
				// Підсвідка місцепризначення
				// $(hash).effect("highlight", {color: '#CCFF33'}, 2000);
				
				done = true;
			}
				
		}
	);
}
