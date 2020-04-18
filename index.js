addEventListener('fetch', event => {
	event.respondWith(handleRequest(event.request))
})
/**
 * Respond with hello worker text
 * @param {Request} request
 */
async function handleRequest(request) {
	let cookieVariantNum = false;
	for (let h of request.headers.entries()) {
		if (h[0] === 'cookie') {
			cookieVariantNum = Number(h[1].split('=')[1]);
		}
	}
	
	let data = await getUrls(cookieVariantNum);
	return data;
}

const getUrls = async (cookieVariantNum) => {
	try {
		let urls = await fetch('https://cfw-takehome.developers.workers.dev/api/variants');
		urls = await urls.json();
		let cookieReceived = false;
		let randIdx = await getRandomInt();
		if (cookieVariantNum) {
			randIdx = cookieVariantNum - 1;
			cookieReceived = true;
		}
		randIdx = Number(randIdx);
		let myUrl = urls.variants[randIdx];
		
		return await fetchVariant(myUrl, randIdx, cookieReceived);
	} catch (err) {
		return new Response(err.stack || err)
	}
}

const getRandomInt = () => {
	return Math.floor(Math.random() * 2);
}

const fetchVariant = async (url, variantNum, cookieReceived) => {
	try {
		let result = await fetch(url);
		result = await result.text();
		let profileType = 'Github';
		let profileUrl = 'https://www.github.com/NrujalSharma';
		
		if (variantNum === 0) {
			profileType = 'LinkedIn';
			profileUrl = 'https://www.linkedin.com/in/nrujal-sharma-718b7a14a/';
		}
		
		const scr = `
			<script>
				document.title = 'I changed the title';
				
				window.addEventListener('DOMContentLoaded', (event) => {
					console.log('DOM fully loaded and parsed');
				});
				
				document.getElementById('title').innerHTML = 'There is a &#127850; in your browser';
				document.getElementById('description').innerHTML = 'The cookie persists for one minute. Until the cookie expires you will receive the same page everytime. After that you will receive a page at random. Enjoy your &#127850;';

				document.getElementById('url').innerHTML = 'Check my ${profileType} Profile';
				document.getElementById('url').href = '${profileUrl}';		
			</script>
		</body>
		`;
		
		result = result.replace('</body>', scr)
		
		const myHeaders = new Headers();
		myHeaders.append('Content-Type', 'text/html');
		if (!cookieReceived)
			myHeaders.append('Set-Cookie', `variantNum=${++variantNum}; Max-Age=60`);
		
		return new Response(result, {
			headers: myHeaders
		});
	} catch (err) {
		return new Response(err.stack || err)
	}
}