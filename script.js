
        document.addEventListener('DOMContentLoaded', () => {
            // --- Theme Toggle ---
            const themeToggleBtn = document.getElementById('theme-toggle');
            const currentTheme = localStorage.getItem('theme') || 'light';
            const htmlElement = document.documentElement;

            function applyTheme(theme) {
                if (theme === 'dark') {
                    htmlElement.classList.add('dark');
                    if (themeToggleBtn) themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
                } else {
                    htmlElement.classList.remove('dark');
                    if (themeToggleBtn) themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
                }
            }
            applyTheme(currentTheme);

            if (themeToggleBtn) {
                themeToggleBtn.addEventListener('click', () => {
                    const newTheme = htmlElement.classList.contains('dark') ? 'light' : 'dark';
                    applyTheme(newTheme);
                    localStorage.setItem('theme', newTheme);
                });
            }

            // --- Language Toggle ---
            const langToggleBtn = document.getElementById('lang-toggle');
            let currentLang = localStorage.getItem('lang') || 'en';
            const translatableElements = document.querySelectorAll('[data-en], [data-kh]');

            function setLanguage(lang) {
                translatableElements.forEach(el => {
                    // Ensure the element is still in the main document before trying to access parentElement
                    if (!document.body.contains(el) && el !== document.documentElement) { // Check if element is detached, exclude html element itself
                        return; 
                    }

                    const textToDisplay = el.dataset[lang];
                    if (textToDisplay !== undefined) {
                        let isLangButtonSpan = false;
                        // Check el.parentElement only if el is a SPAN and el.parentElement exists
                        if (el.tagName === 'SPAN' && el.parentElement && el.parentElement.id === 'lang-toggle') {
                            isLangButtonSpan = true;
                        }
                        if (isLangButtonSpan) {
                            el.textContent = textToDisplay.toUpperCase();
                        } else {
                            el.textContent = textToDisplay;
                        }
                    }
                });
                localStorage.setItem('lang', lang);
                currentLang = lang;
                if (typeof filterAndSearchProducts === 'function') {
                    filterAndSearchProducts();
                }
            }
            
            if (langToggleBtn) {
                langToggleBtn.addEventListener('click', () => {
                    const newLang = currentLang === 'en' ? 'kh' : 'en';
                    setLanguage(newLang);
                });
            }
            
            const mobileMenuButton = document.getElementById('mobile-menu-button');
            const mobileMenu = document.getElementById('mobile-menu');
            if (mobileMenuButton && mobileMenu) {
                mobileMenuButton.addEventListener('click', () => {
                    mobileMenu.classList.toggle('open');
                });
            }

            const currentYearElement = document.getElementById('currentYear');
            if (currentYearElement) {
                currentYearElement.textContent = new Date().getFullYear();
            }
            
            const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
            const sections = document.querySelectorAll('section[id]'); 

            function changeNavActiveState() {
                let index = sections.length;
                while(--index >= 0 && window.scrollY + 150 < sections[index].offsetTop) {} 
                
                navLinks.forEach((link) => link.classList.remove('active'));
                
                const currentSectionId = (index >= 0 && sections[index]) ? sections[index].id : null;

                if (currentSectionId) {
                    const desktopTargetLink = document.querySelector(`.nav-link[href="#${currentSectionId}"]`);
                    if (desktopTargetLink) desktopTargetLink.classList.add('active');
                    const mobileTargetLink = document.querySelector(`.mobile-nav-link[href="#${currentSectionId}"]`);
                    if (mobileTargetLink) mobileTargetLink.classList.add('active');
                } else { 
                     const homeLink = document.querySelector('.nav-link[href="#"]'); 
                     if(homeLink) homeLink.classList.add('active');
                     const mobileHomeLink = document.querySelector('.mobile-nav-link[href="#"]');
                     if(mobileHomeLink) mobileHomeLink.classList.add('active');
                }
            }
            
            if (sections.length > 0) { 
                changeNavActiveState(); 
                window.addEventListener('scroll', changeNavActiveState);
            }

            navLinks.forEach(anchor => {
                anchor.addEventListener('click', function (e) {
                    const targetId = this.getAttribute('href');
                    if (targetId.startsWith('#') && targetId.length > 1 && 
                        targetId !== '#cart-modal' && 
                        targetId !== '#payment-modal' && 
                        targetId !== '#order-confirmation-modal' &&
                        targetId !== '#quick-view-modal' &&
                        targetId !== '#auth-modal' ) { 
                        e.preventDefault();
                        try {
                            const targetElement = document.querySelector(targetId);
                            if (targetElement) {
                                if (sections.length > 0) window.removeEventListener('scroll', changeNavActiveState); 
                                targetElement.scrollIntoView({ behavior: 'smooth' });
                                navLinks.forEach(link => link.classList.remove('active'));
                                this.classList.add('active');
                                if (this.classList.contains('nav-link')) {
                                    const mobileEquivalent = document.querySelector(`.mobile-nav-link[href="${targetId}"]`);
                                    if (mobileEquivalent) mobileEquivalent.classList.add('active');
                                } else {
                                    const desktopEquivalent = document.querySelector(`.nav-link[href="${targetId}"]`);
                                    if (desktopEquivalent) desktopEquivalent.classList.add('active');
                                }
                                if (mobileMenu && mobileMenu.classList.contains('open')) {
                                    mobileMenu.classList.remove('open');
                                }
                                if (sections.length > 0) {
                                    setTimeout(() => {
                                        window.addEventListener('scroll', changeNavActiveState);
                                        changeNavActiveState(); 
                                    }, 700); 
                                }
                            }
                        } catch (error) {
                            console.error('Error finding smooth scroll target:', targetId, error);
                        }
                    } else if (targetId === '#cart-modal') { 
                        e.preventDefault();
                        openCartModal();
                    }
                });
            });

            const allProductData = [];
            document.querySelectorAll('#product-grid .product-card').forEach(card => {
                const nameEnEl = card.querySelector('h3[data-en]');
                const nameKhEl = card.querySelector('h3[data-kh]');
                const descEnEl = card.querySelector('p[data-en]');
                const descKhEl = card.querySelector('p[data-kh]');
                const priceEl = card.querySelector('[data-price]');
                const imgEl = card.querySelector('img');
                const addToCartBtnEl = card.querySelector('.add-to-cart-btn');

                if (nameEnEl && nameKhEl && descEnEl && descKhEl && priceEl && imgEl && addToCartBtnEl) {
                    allProductData.push({
                        id: addToCartBtnEl.dataset.productId,
                        nameEn: nameEnEl.dataset.en,
                        nameKh: nameKhEl.dataset.kh,
                        descriptionEn: descEnEl.dataset.en,
                        descriptionKh: descKhEl.dataset.kh,
                        price: parseFloat(priceEl.dataset.price),
                        image: imgEl.src,
                        cartImage: addToCartBtnEl.dataset.productImage,
                        category: card.dataset.category,
                        element: card 
                    });
                } else {
                    console.warn("A product card is missing some data attributes or elements:", card);
                }
            });
            
            const searchInput = document.getElementById('search-input');
            const categoryButtons = document.querySelectorAll('.category-btn');
            const productGrid = document.getElementById('product-grid');
            const noResultsMessage = document.getElementById('no-results-message');
            let currentSelectedCategory = 'all';

            function filterAndSearchProducts() {
                if (!searchInput || !productGrid || !noResultsMessage) return; // Guard clause

                const searchTerm = searchInput.value.toLowerCase().trim();
                let productsFound = false;

                allProductData.forEach(product => {
                    if (!product.element) return; // Skip if element reference is missing

                    const productNameCurrentLang = currentLang === 'kh' ? product.nameKh : product.nameEn;
                    // const productDescriptionCurrentLang = currentLang === 'kh' ? product.descriptionKh : product.descriptionEn; // Not used in search currently
                    
                    const matchesCategory = currentSelectedCategory === 'all' || product.category === currentSelectedCategory;
                    const matchesSearch = !searchTerm || 
                                          (productNameCurrentLang && productNameCurrentLang.toLowerCase().includes(searchTerm)) || 
                                          (product.descriptionEn && product.descriptionEn.toLowerCase().includes(searchTerm)) || 
                                          (product.nameEn && product.nameEn.toLowerCase().includes(searchTerm));


                    if (matchesCategory && matchesSearch) {
                        product.element.style.display = 'block';
                        product.element.classList.remove('revealed'); 
                        setTimeout(() => product.element.classList.add('revealed'), 10);
                        productsFound = true;
                    } else {
                        product.element.style.display = 'none';
                    }
                });
                noResultsMessage.classList.toggle('hidden', productsFound);
            }

            if (searchInput) {
                searchInput.addEventListener('input', filterAndSearchProducts);
            }

            categoryButtons.forEach(button => {
                button.addEventListener('click', () => {
                    categoryButtons.forEach(btn => {
                        btn.classList.remove('active', 'bg-theme-accent', 'text-white');
                        // btn.classList.add('border-theme-accent'); // This line might be redundant if base style is border
                    });
                    button.classList.add('active', 'bg-theme-accent', 'text-white');
                    // button.classList.remove('border-theme-accent'); // Only remove if it was specifically added
                    currentSelectedCategory = button.dataset.category;
                    filterAndSearchProducts();
                });
            });

            const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
            const cartCountDesktop = document.getElementById('cart-count-desktop');
            const cartCountMobile = document.getElementById('cart-count-mobile');
            const cartItemsContainer = document.getElementById('cart-items-container');
            const cartTotalElement = document.getElementById('cart-total');
            const emptyCartMessage = document.getElementById('empty-cart-message');
            const checkoutBtn = document.getElementById('checkout-btn');
            
            const cartModal = document.getElementById('cart-modal');
            const closeCartModalButton = document.getElementById('close-cart-modal');
            
            const paymentModal = document.getElementById('payment-modal');
            const closePaymentModalBtn = document.getElementById('close-payment-modal');
            const confirmPaymentBtn = document.getElementById('confirm-payment-btn');

            const orderConfirmationModal = document.getElementById('order-confirmation-modal');
            const printReceiptBtn = document.getElementById('print-receipt-btn');
            const closeConfirmationModalBtn = document.getElementById('close-confirmation-modal');
            const receiptDetailsContainer = document.getElementById('receipt-details');

            const quickViewModal = document.getElementById('quick-view-modal');
            const closeQuickViewModalBtn = document.getElementById('close-quick-view-modal');
            const quickViewImage = document.getElementById('quick-view-image');
            const quickViewName = document.getElementById('quick-view-name');
            const quickViewPrice = document.getElementById('quick-view-price');
            const quickViewDescription = document.getElementById('quick-view-description');
            const quickViewAddToCartBtn = document.getElementById('quick-view-add-to-cart-btn');

            let cart = []; 

            const toastMessagesEn = {
                addedToCart: "added to cart!", itemRemoved: "Item removed from cart.",
                paymentProcessing: "Processing payment...", paymentSuccessful: "Payment successful! Order confirmed.",
                locationSet: "Location set to:", messageSent: "Thank you for your message!", subscribed: "Thank you for subscribing!"
            };
            const toastMessagesKh = {
                addedToCart: "បានបន្ថែមទៅកន្ត្រក!", itemRemoved: "ទំនិញត្រូវបានដកចេញពីកន្ត្រក។",
                paymentProcessing: "កំពុងដំណើរការទូទាត់...", paymentSuccessful: "ការទូទាត់បានជោគជ័យ! ការបញ្ជាទិញត្រូវបានបញ្ជាក់។",
                locationSet: "ទីតាំងត្រូវបានកំណត់ទៅ៖", messageSent: "សូមអរគុណចំពោះសាររបស់អ្នក!", subscribed: "សូមអរគុណសម្រាប់ការជាវ!"
            };

            function showToast(messageKey, itemName = "") { 
                const toast = document.getElementById('toast-notification');
                const toastMessageEl = document.getElementById('toast-message');
                if (toast && toastMessageEl) {
                    let message = currentLang === 'kh' ? toastMessagesKh[messageKey] : toastMessagesEn[messageKey];
                    if (itemName && messageKey === 'addedToCart') { 
                        message = `${itemName} ${message}`;
                    } else {
                         message = message || messageKey; 
                    }
                    toastMessageEl.textContent = message;
                    toast.classList.remove('hidden');
                    toast.classList.add('animate-fadeInOut');
                    setTimeout(() => {
                        toast.classList.add('hidden');
                        toast.classList.remove('animate-fadeInOut');
                    }, 3000);
                }
            }

            function handleAddToCart(productId, productName, productPrice, productImage) {
                const existingItem = cart.find(item => item.id === productId);
                if (existingItem) {
                    existingItem.quantity++;
                } else {
                    cart.push({ id: productId, name: productName, price: productPrice, image: productImage, quantity: 1 });
                }
                updateCartDisplay();
                showToast('addedToCart', productName);
            }

            addToCartButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const productId = button.dataset.productId;
                    const productData = allProductData.find(p => p.id === productId);
                    if (productData) {
                        handleAddToCart(productData.id, productData.nameEn, productData.price, productData.cartImage);
                    }
                });
            });

            function updateCartDisplay() {
                let totalItems = 0;
                let totalPrice = 0;
                if (cartItemsContainer) cartItemsContainer.innerHTML = ''; 
                if (cart.length === 0) {
                    if(emptyCartMessage) emptyCartMessage.classList.remove('hidden');
                } else {
                    if(emptyCartMessage) emptyCartMessage.classList.add('hidden');
                    cart.forEach(item => {
                        totalItems += item.quantity;
                        totalPrice += item.price * item.quantity;
                        const cartItemElement = document.createElement('div');
                        cartItemElement.classList.add('flex', 'items-center', 'justify-between', 'py-3', 'border-b', 'last:border-b-0');
                        cartItemElement.style.borderColor = 'var(--modal-border)'; // Ensure themed border
                        cartItemElement.innerHTML = `
                            <div class="flex items-center">
                                <img src="${item.image}" alt="${item.name}" class="w-16 h-16 object-cover rounded-md mr-4">
                                <div>
                                    <h4 class="font-semibold">${item.name}</h4>
                                    <p class="text-sm section-subtitle">$${item.price.toFixed(2)} x ${item.quantity}</p>
                                </div>
                            </div>
                            <div class="flex items-center">
                                <button class="quantity-change text-red-500 hover:text-red-700 px-2" data-id="${item.id}" data-change="-1">-</button>
                                <span class="mx-2">${item.quantity}</span>
                                <button class="quantity-change text-green-500 hover:text-green-700 px-2" data-id="${item.id}" data-change="1">+</button>
                                <button class="remove-item text-red-500 hover:text-red-700 ml-4" data-id="${item.id}"><i class="fas fa-trash-alt"></i></button>
                            </div>`;
                        if (cartItemsContainer) cartItemsContainer.appendChild(cartItemElement);
                    });
                }
                if (cartCountDesktop) {
                    cartCountDesktop.textContent = totalItems;
                    cartCountDesktop.classList.toggle('hidden', totalItems === 0);
                }
                if (cartCountMobile) {
                    cartCountMobile.textContent = totalItems;
                    cartCountMobile.classList.toggle('hidden', totalItems === 0);
                }
                if (cartTotalElement) cartTotalElement.textContent = `$${totalPrice.toFixed(2)}`;
                if (checkoutBtn) checkoutBtn.disabled = cart.length === 0;
                document.querySelectorAll('.quantity-change').forEach(button => button.addEventListener('click', handleQuantityChange));
                document.querySelectorAll('.remove-item').forEach(button => button.addEventListener('click', handleRemoveItem));
                setLanguage(currentLang); 
            }
            
            function handleQuantityChange(event) {
                const productId = event.target.dataset.id;
                const change = parseInt(event.target.dataset.change);
                const item = cart.find(p => p.id === productId);
                if (item) {
                    item.quantity += change;
                    if (item.quantity <= 0) cart = cart.filter(p => p.id !== productId); 
                }
                updateCartDisplay();
            }

            function handleRemoveItem(event) {
                const buttonElement = event.target.closest('.remove-item');
                if (buttonElement) {
                    const productId = buttonElement.dataset.id; 
                    cart = cart.filter(p => p.id !== productId);
                    updateCartDisplay();
                    showToast('itemRemoved');
                }
            }

            function openCartModal() {
                if (cartModal) cartModal.classList.remove('hidden');
                updateCartDisplay(); 
                setLanguage(currentLang); 
            }
            function closeCart() {
                if (cartModal) cartModal.classList.add('hidden');
            }

            if (closeCartModalButton) closeCartModalButton.addEventListener('click', closeCart);
            if (cartModal) cartModal.addEventListener('click', (event) => { if (event.target === cartModal) closeCart(); });

            if (checkoutBtn) {
                checkoutBtn.addEventListener('click', () => {
                    if (cart.length > 0) {
                        closeCart();
                        if (paymentModal) paymentModal.classList.remove('hidden');
                        setLanguage(currentLang); 
                    }
                });
            }
            if (closePaymentModalBtn) closePaymentModalBtn.addEventListener('click', () => { if (paymentModal) paymentModal.classList.add('hidden'); });
            if (paymentModal) paymentModal.addEventListener('click', (event) => { if (event.target === paymentModal) paymentModal.classList.add('hidden'); });

            if (confirmPaymentBtn) {
                confirmPaymentBtn.addEventListener('click', () => {
                    showToast('paymentProcessing');
                    setTimeout(() => {
                        if (paymentModal) paymentModal.classList.add('hidden');
                        showToast('paymentSuccessful');
                        generateAndShowReceipt(); 
                        if (orderConfirmationModal) orderConfirmationModal.classList.remove('hidden');
                        setLanguage(currentLang); 
                        updateCartDisplay(); 
                    }, 2000);
                });
            }

            function generateAndShowReceipt() {
                if (!receiptDetailsContainer) return;
                receiptDetailsContainer.innerHTML = ''; 
                let receiptHTML = `<h3 class="text-lg font-semibold mb-2" data-en="Order Summary" data-kh="สรุปการสั่งซื้อ">Order Summary</h3>`; 
                receiptHTML += `<p class="mb-1"><strong data-en="Order ID:" data-kh="លេខសម្គាល់ការสั่งទិញ៖">Order ID:</strong> #${Math.floor(Math.random() * 1000000)} (Demo)</p>`;
                receiptHTML += `<p class="mb-2"><strong data-en="Date:" data-kh="កាលបរិច្ឆេទ៖">Date:</strong> ${new Date().toLocaleDateString()}</p>`;
                receiptHTML += '<ul class="list-disc list-inside mb-2">';
                let finalTotal = 0;
                const receiptCart = [...cart]; 
                receiptCart.forEach(item => { 
                    receiptHTML += `<li>${item.name} (x${item.quantity}) - $${(item.price * item.quantity).toFixed(2)}</li>`;
                    finalTotal += item.price * item.quantity;
                });
                receiptHTML += '</ul>';
                receiptHTML += `<p class="font-bold text-lg"><strong data-en="Total Paid:" data-kh="ยอดรวมที่ชำระแล้ว៖">Total Paid:</strong> $${finalTotal.toFixed(2)}</p>`;
                receiptDetailsContainer.innerHTML = receiptHTML;
                cart = []; 
            }

            if (printReceiptBtn) printReceiptBtn.addEventListener('click', () => window.print());
            if (closeConfirmationModalBtn) closeConfirmationModalBtn.addEventListener('click', () => { if (orderConfirmationModal) orderConfirmationModal.classList.add('hidden'); });
            if (orderConfirmationModal) orderConfirmationModal.addEventListener('click', (event) => { if (event.target === orderConfirmationModal) orderConfirmationModal.classList.add('hidden'); });
            
            document.querySelectorAll('.quick-view-btn').forEach(button => {
                button.addEventListener('click', () => {
                    const productId = button.dataset.productId;
                    const product = allProductData.find(p => p.id === productId);
                    if (product && quickViewModal && quickViewImage && quickViewName && quickViewPrice && quickViewDescription && quickViewAddToCartBtn) {
                        quickViewImage.src = product.image;
                        quickViewImage.alt = currentLang === 'kh' ? product.nameKh : product.nameEn;
                        quickViewName.textContent = currentLang === 'kh' ? product.nameKh : product.nameEn;
                        quickViewPrice.textContent = `$${product.price.toFixed(2)}`;
                        quickViewDescription.textContent = currentLang === 'kh' ? product.descriptionKh : product.descriptionEn;
                        quickViewAddToCartBtn.dataset.productId = product.id;
                        quickViewAddToCartBtn.dataset.productName = product.nameEn;
                        quickViewAddToCartBtn.dataset.productPrice = product.price;
                        quickViewAddToCartBtn.dataset.productImage = product.cartImage;
                        quickViewModal.classList.remove('hidden');
                        setLanguage(currentLang); 
                    }
                });
            });

            if (closeQuickViewModalBtn) closeQuickViewModalBtn.addEventListener('click', () => { if (quickViewModal) quickViewModal.classList.add('hidden'); });
            if (quickViewModal) quickViewModal.addEventListener('click', (event) => { if (event.target === quickViewModal) quickViewModal.classList.add('hidden'); });
            
            if (quickViewAddToCartBtn) {
                 quickViewAddToCartBtn.addEventListener('click', () => {
                    const productId = quickViewAddToCartBtn.dataset.productId;
                    const productData = allProductData.find(p => p.id === productId);
                     if (productData) {
                        handleAddToCart(productData.id, productData.nameEn, productData.price, productData.cartImage);
                        if (quickViewModal) quickViewModal.classList.add('hidden'); 
                    }
                });
            }

            const locationInput = document.getElementById('location-input');
            const setLocationBtn = document.getElementById('set-location-btn');
            const locationDisplay = document.getElementById('location-display');
            if (setLocationBtn && locationInput && locationDisplay) {
                setLocationBtn.addEventListener('click', () => {
                    const location = locationInput.value.trim();
                    if (location) {
                        const messageEn = `${toastMessagesEn.locationSet} ${location}. (Shipping rates may vary - Demo)`;
                        const messageKh = `${toastMessagesKh.locationSet} ${location}។ (អត្រាដឹកជញ្ជូនអាចប្រែប្រួល - សាកល្បង)`;
                        locationDisplay.textContent = currentLang === 'kh' ? messageKh : messageEn;
                        locationInput.value = '';
                    } else {
                         locationDisplay.textContent = currentLang === 'kh' ? 'សូមបញ្ចូលទីតាំង។' : 'Please enter a location.';
                    }
                });
            }
            
            const contactForm = document.getElementById('contact-form');
            const formMessage = document.getElementById('form-message');
            if (contactForm && formMessage) {
                contactForm.addEventListener('submit', function(e) {
                    e.preventDefault();
                    formMessage.textContent = currentLang === 'kh' ? toastMessagesKh.messageSent : toastMessagesEn.messageSent;
                    formMessage.className = 'mt-4 text-lg text-green-200'; 
                    contactForm.reset(); 
                    setTimeout(() => { formMessage.textContent = ''; formMessage.className = 'mt-4 text-lg'; }, 5000);
                });
            }

            const newsletterForm = document.getElementById('newsletter-form');
            const newsletterMessage = document.getElementById('newsletter-message');
            if (newsletterForm && newsletterMessage) {
                newsletterForm.addEventListener('submit', function(e) {
                    e.preventDefault();
                    const emailInput = newsletterForm.querySelector('input[type="email"]');
                    if (emailInput && emailInput.value) {
                        newsletterMessage.textContent = currentLang === 'kh' ? `${toastMessagesKh.subscribed} (${emailInput.value})` : `${toastMessagesEn.subscribed} (${emailInput.value})`;
                        newsletterMessage.className = 'mt-2 text-sm'; 
                        newsletterForm.reset();
                        setTimeout(() => { newsletterMessage.textContent = ''; }, 5000);
                    }
                });
            }

            const revealElements = document.querySelectorAll('.reveal-on-scroll');
            const revealObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('revealed'); });
            }, { threshold: 0.1 }); 
            revealElements.forEach(el => revealObserver.observe(el));

            // Add event listeners for favorite buttons
            document.querySelectorAll('.favorite-btn').forEach(button => {
                button.addEventListener('click', function() {
                    this.querySelector('i').classList.toggle('far'); // Toggle empty heart
                    this.querySelector('i').classList.toggle('fas'); // Toggle filled heart
                    // Here you would add logic to save/remove from a wishlist (e.g., using localStorage or backend)
                    const productName = this.closest('.product-card').querySelector('h3[data-en]').dataset.en;
                    if (this.querySelector('i').classList.contains('fas')) {
                        showToast('addedToFavorites', productName); // Assuming you add this key to toastMessages
                    } else {
                        showToast('removedFromFavorites', productName); // Assuming you add this key
                    }
                });
            });
            // Add new toast messages for favorites
            toastMessagesEn.addedToFavorites = "added to favorites!";
            toastMessagesEn.removedFromFavorites = "removed from favorites.";
            toastMessagesKh.addedToFavorites = "បានបន្ថែមទៅรายการโปรด!";
            toastMessagesKh.removedFromFavorites = "បានដកចេញពីรายการโปรด។";


            updateCartDisplay(); 
            setLanguage(currentLang); 
        });
    