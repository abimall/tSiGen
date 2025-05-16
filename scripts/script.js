document.addEventListener('DOMContentLoaded', function () {
    const mobileGroup = document.getElementById('mobileGroup');
    const showMobileCheckbox = document.getElementById('showMobile');
    const generateButton = document.querySelector('.button');
    const signatureContainer = document.getElementById('signature-container');
    const copyButton = document.getElementById('copyButton');

    function updateMobileFieldVisibility() {
        mobileGroup.classList.toggle('hidden', !showMobileCheckbox.checked);
    }

    updateMobileFieldVisibility();
    showMobileCheckbox.addEventListener('change', updateMobileFieldVisibility);

    generateButton.addEventListener('click', generateSignature);

    generateButton.addEventListener('click', (e) => {
        const rect = generateButton.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        generateButton.style.setProperty('--mouse-x', `${x}px`);
        generateButton.style.setProperty('--mouse-y', `${y}px`);
    });

    copyButton.addEventListener('click', () => {
        const inlineHtml = generateInlineStyledHtml();

        // Создаём временный контейнер для копирования
        const tempDiv = document.createElement('div');
        tempDiv.style.position = 'absolute';
        tempDiv.style.left = '-9999px'; // Скрываем элемент за пределами экрана
        tempDiv.innerHTML = inlineHtml;
        document.body.appendChild(tempDiv);

        // Выделяем содержимое
        const range = document.createRange();
        range.selectNodeContents(tempDiv);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);

        // Копируем выделенное
        try {
            document.execCommand('copy');
            alert('Подпись с форматированием скопирована в буфер обмена!');
        } catch (err) {
            console.error('Ошибка копирования:', err);
            // Запасной вариант: копируем как текст
            navigator.clipboard.writeText(inlineHtml).then(() => {
                alert('HTML-код скопирован как текст (форматирование может не сохраниться).');
            }).catch(err => {
                console.error('Ошибка копирования текста:', err);
                alert('Не удалось скопировать HTML-код.');
            });
        }

        // Удаляем временный контейнер и очищаем выделение
        document.body.removeChild(tempDiv);
        selection.removeAllRanges();
    });

    function generateSignature() {
        const office = document.getElementById('office').value || '330';
        const address = `600005, г.Владимир, ул.Тракторная, д.45, офис ${office}`;
        const extension = document.getElementById('extension').value || '2144';
        const formattedExtension = `+7 (4922) 53-77-55 (${extension.padStart(4, '0')})`;
        const mobile = document.getElementById('mobile').value || '';
        const email = document.getElementById('email').value || 'name@domain.ru';
        const web = 'abidev.ru';

        let lines = [
            { icon: 'img/address-icon.png', text: address },
            { icon: 'img/phone-icon.png', text: formattedExtension },
            { icon: 'img/email-icon.png', text: email },
            { icon: 'img/web-icon.png', text: web }
        ];

        if (showMobileCheckbox.checked && mobile) {
            lines.splice(2, 0, { icon: 'img/phone-icon.png', text: mobile });
        }

        const lineCount = lines.length;
        const offsetClass = lineCount === 4 ? 'four-lines' : 'five-lines';

        const signatureHtml = `
            <div class="signature-content ${offsetClass}">
                <img src="img/logo.png" alt="Логотип" class="signature-logo">
                <div class="signature-text">
                    ${lines.map(line => `
                        <div class="signature-line">
                            <img src="${line.icon}" alt="Иконка" class="signature-icon">
                            <span>${line.text}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        signatureContainer.innerHTML = signatureHtml;
        copyButton.style.display = 'block';
    }

    function generateInlineStyledHtml() {
        const office = document.getElementById('office').value || '330';
        const address = `600005, г.Владимир, ул.Тракторная, д.45, офис ${office}`;
        const extension = document.getElementById('extension').value || '2144';
        const formattedExtension = `+7 (4922) 53-77-55 (${extension.padStart(4, '0')})`;
        const mobile = document.getElementById('mobile').value || '';
        const email = document.getElementById('email').value || 'name@domain.ru';
        const web = 'abidev.ru';

        let lines = [
            { icon: 'img/address-icon.png', text: address },
            { icon: 'img/phone-icon.png', text: formattedExtension },
            { icon: 'img/email-icon.png', text: email, isEmail: true },
            { icon: 'img/web-icon.png', text: web, isWeb: true }
        ];

        if (showMobileCheckbox.checked && mobile) {
            lines.splice(2, 0, { icon: 'img/phone-icon.png', text: mobile });
        }

        // HTML с inline-стилями и атрибутами для лучшей совместимости с Outlook
        const inlineHtml = `
            <table cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff" style="background-color: #ffffff; font-family: 'Calibri', sans-serif; font-size: 11.5px; color: #000000; text-decoration: none;">
                <tr>
                    <td style="vertical-align: middle; padding-right: 10px;">
                        <img src="img/logo.png" alt="Логотип" width="171" height="88" style="width: 171px; height: 88px;">
                    </td>
                    <td style="vertical-align: middle;">
                        ${lines.map(line => `
                            <div style="margin-bottom: 5px; color: #000000; text-decoration: none;">
                                <img src="${line.icon}" alt="Иконка" width="10" height="10" style="width: 10px; height: 10px; vertical-align: middle; margin-right: 10px;">
                                <span style="color: #000000; text-decoration: none; vertical-align: middle;">
                                    ${line.isEmail ? `<span style="color: #000000 !important; text-decoration: none !important;">${line.text}</span>` : 
                                    line.isWeb ? `<span style="color: #000000 !important; text-decoration: none !important;">${line.text}</span>` : 
                                    line.text}
                                </span>
                            </div>
                        `).join('')}
                    </td>
                </tr>
            </table>
        `;

        return inlineHtml;
    }
});