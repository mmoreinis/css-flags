var next, country, short;

function addFlag(){
    let country = prompt("What country?");
    let short = prompt("Short name?")
    let next = prompt("After which?");
    
    // Store values globally for confirmChanges() to use
    window.cardData = { country, short, next };
    
    addNewCard(country, short, next);
}

/*
 * addNewCard(country,short,next)
 * finds the country card in index.html associated with the value of next and after that card,
 * creates a new div without identifiers.  Within that div, 
 * creates a new card based on the card template in template.html as follows
 * 1) enters the value of country wherever the country name is referenced with a capital letter.
 * 2) enters the value of short wherever the country name is referenced with a small letter.
 * Then, in style.css, find the rule beginning #[next] and duplicate that line, replacing instances
 * of [next] with [short].
 * End with the alert message, created [country] as [short] after [next]
 * @param: country (string), short (string), next (string)
 * @return: none
 */ 
function addNewCard(country, short, next){
    // Fetch the template.html file
    fetch('template.html')
        .then(response => response.text())
        .then(html => {
            // Replace template placeholders with actual values
            let newCardHtml = html
                .replace(/\[Country\]/g, country)
                .replace(/\[country\]/g, country)
                .replace(/>Country</g, '>' + country + '<')
                .replace(/\[short\]/g, short)
                .replace(/id="short"/g, 'id="' + short + '"')
                .replace(/href='short'/g, "href='" + short + "'");
            
            // Find the SVG element with id matching 'next'
            const nextSvg = document.getElementById(next);
            if (!nextSvg) {
                alert('Error: Country "' + next + '" not found');
                return;
            }
            
            // Navigate up to find the .col container
            let colElement = nextSvg.closest('.col');
            if (!colElement) {
                alert('Error: Could not find parent .col element');
                return;
            }
            
            // Parse the new card HTML
            const tempContainer = document.createElement('div');
            tempContainer.innerHTML = newCardHtml.trim();
            
            // Get all child elements (skip text nodes)
            const children = Array.from(tempContainer.children);
            if (children.length === 0) {
                alert('Error: Template produced no elements');
                return;
            }
            
            // Get the .col element from parsed content
            const newColElement = children.find(el => el.classList && el.classList.contains('col'));
            if (!newColElement) {
                alert('Error: Template did not contain a .col element');
                return;
            }
            
            // Create a comment node with the country name
            const comment = document.createComment(' ' + country + ' ');
            
            // Create a wrapper div without identifiers to encapsulate the comment and card
            const wrapperDiv = document.createElement('div');
            wrapperDiv.appendChild(comment);
            wrapperDiv.appendChild(newColElement);
            
            // Insert the wrapper div after the existing card
            const container = colElement.parentNode;
            container.insertBefore(wrapperDiv, colElement.nextSibling);
            
            // Fetch and update style.css with the new CSS rule
            fetch('style.css')
                .then(response => response.text())
                .then(cssContent => {
                    // Find the CSS rule for the 'next' country
                    const nextCssRule = `#${next} {background-image:url(images/${next}.png);}`;
                    
                    // Create a new CSS rule for the new country
                    const newCssRule = `#${short} {background-image:url(images/${short}.png);}`;
                    
                    // Find the position to insert (after the next country's rule)
                    const insertPosition = cssContent.indexOf(nextCssRule);
                    if (insertPosition !== -1) {
                        // Insert the new rule after the next country's rule
                        const endPosition = insertPosition + nextCssRule.length;
                        const updatedCss = cssContent.slice(0, endPosition) + '\n' + newCssRule + cssContent.slice(endPosition);
                        
                        // Store the updated CSS in a global variable for download
                        window.updatedCssContent = updatedCss;
                    }
                })
                .catch(error => {
                    console.log('Note: Could not load style.css for update (this is OK)');
                });
            
            alert('created ' + country + ' as ' + short + ' after ' + next);
        })
        .catch(error => {
            alert('Error: ' + error.message);
        });
}

