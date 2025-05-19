document.addEventListener('DOMContentLoaded', function () {
    // Конфиг, где собрано всё про внешний вид подписи — логотипы, цвета, шрифты и прочее
    const signatureFormatting = {
        logo: {
            src: 'img/logo.png',
            alt: 'Логотип',
            width: 171,
            height: 88
        },
        icon: {
            width: 10,
            height: 10,
            marginRight: '10px'
        },
        table: {
            backgroundColor: '#ffffff',
            fontFamily: "'Calibri', Arial, sans-serif", // Запасной шрифт на случай, если Calibri вдруг не загрузится
            fontSize: '10pt', // Outlook не дружит с px, ставим pt
            textColor: '#000000'
        },
        layout: {
            lineMarginBottom: '5px',
            cellPaddingRight: '10px'
        },
        defaultValues: {
            office: '330',
            extension: '2144',
            email: 'name@domain.ru',
            web: 'abidev.ru',
            addressPrefix: '600005, г.Владимир, ул.Тракторная, д.45, офис '
        }
    };

    // Тащим нужные элементы со страницы
    const mobileGroup = document.getElementById('mobileGroup');
    const showMobileCheckbox = document.getElementById('showMobile');
    const generateButton = document.querySelector('.button');
    const signatureContainer = document.getElementById('signature-container');
    const copyButton = document.getElementById('copyButton');

    // Показываем или скрываем поле для мобильника в зависимости от чекбокса
    function updateMobileFieldVisibility() {
        mobileGroup.classList.toggle('hidden', !showMobileCheckbox.checked);
    }

    updateMobileFieldVisibility();
    showMobileCheckbox.addEventListener('change', updateMobileFieldVisibility);

    // Обработчик для генерации подписи
    generateButton.addEventListener('click', generateSignature);

    // Красивый эффект мыши по кнопке генерации — просто визуальная фишка
    generateButton.addEventListener('click', (e) => {
        const rect = generateButton.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        generateButton.style.setProperty('--mouse-x', `${x}px`);
        generateButton.style.setProperty('--mouse-y', `${y}px`);
    });

    // ======= COPY BUTTON ======= //
    copyButton.addEventListener('click', () => {
        // Генерим HTML с инлайн-стилями для Outlook и прочих ворчливых клиентов
        const inlineHtml = generateInlineStyledHtml();

        // Создаём временный div вне экрана, туда пихаем нашу подпись
        const tempDiv = document.createElement('div');
        tempDiv.style.position = 'absolute';
        tempDiv.style.left = '-9999px';
        tempDiv.innerHTML = inlineHtml;
        document.body.appendChild(tempDiv);

        // Выделяем контент
        const range = document.createRange();
        range.selectNodeContents(tempDiv);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);

        // Пытаемся скопировать через старый добрый execCommand
        try {
            document.execCommand('copy');
            alert('Подпись с форматированием скопирована в буфер обмена!');
        } catch (err) {
            // Если не получилось, пробуем modern way
            console.error('Ошибка копирования:', err);
            navigator.clipboard.writeText(inlineHtml).then(() => {
                alert('HTML-код скопирован как текст (форматирование может не сохраниться).');
            }).catch(err => {
                console.error('Ошибка копирования текста:', err);
                alert('Не удалось скопировать HTML-код.');
            });
        }

        // Убираем за собой
        document.body.removeChild(tempDiv);
        selection.removeAllRanges();
    });

    // ======= ГЕНЕРАЦИЯ ПРЕВЬЮ ПОДПИСИ ======= //
    function generateSignature() {
        // Собираем данные с полей (или подставляем дефолт)
        const office = document.getElementById('office').value || signatureFormatting.defaultValues.office;
        const address = `${signatureFormatting.defaultValues.addressPrefix}${office}`;
        const extension = document.getElementById('extension').value || signatureFormatting.defaultValues.extension;
        const formattedExtension = `+7 (4922) 53-77-55 (${extension.padStart(4, '0')})`;
        const mobile = document.getElementById('mobile').value || '';
        const email = document.getElementById('email').value || signatureFormatting.defaultValues.email;
        const web = signatureFormatting.defaultValues.web;

        // Список строк для отображения — адрес, телефоны, email, сайт
        let lines = [
            { icon: 'img/address-icon.png', text: address },
            { icon: 'img/phone-icon.png', text: formattedExtension },
            { icon: 'img/email-icon.png', text: email },
            { icon: 'img/web-icon.png', text: web }
        ];

        // Если указан мобильный и включён чекбокс — вставляем между телефонами и email
        if (showMobileCheckbox.checked && mobile) {
            lines.splice(2, 0, { icon: 'img/phone-icon.png', text: mobile });
        }

        // Кол-во строк влияет на отступы
        const lineCount = lines.length;
        const offsetClass = lineCount === 4 ? 'four-lines' : 'five-lines';

        // Собираем HTML подписи
        const signatureHtml = `
            <div class="signature-content ${offsetClass}">
                <img src="${signatureFormatting.logo.src}" alt="${signatureFormatting.logo.alt}" class="signature-logo">
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
        copyButton.style.display = 'block'; // Показываем кнопку копирования
    }

    // ======= INLINE HTML ДЛЯ OUTLOOK И ДРУГИХ МУДАКОВ ======= //
    function generateInlineStyledHtml() {
        // Те же данные, что и выше
        const office = document.getElementById('office').value || signatureFormatting.defaultValues.office;
        const address = `${signatureFormatting.defaultValues.addressPrefix}${office}`;
        const extension = document.getElementById('extension').value || signatureFormatting.defaultValues.extension;
        const formattedExtension = `+7 (4922) 53 77 55 (${extension.padStart(4, '0')})`;
        const mobile = document.getElementById('mobile').value || '';
        const email = document.getElementById('email').value || signatureFormatting.defaultValues.email;
        const web = signatureFormatting.defaultValues.web;

        let lines = [
            { icon: 'img/address-icon.png', text: address },
            { icon: 'img/phone-icon.png', text: formattedExtension },
            { icon: 'img/email-icon.png', text: email, isEmail: true },
            { icon: 'img/web-icon.png', text: web, isWeb: true }
        ];

        if (showMobileCheckbox.checked && mobile) {
            lines.splice(2, 0, { icon: 'img/phone-icon.png', text: mobile });
        }

        // Генерим HTML с табличной вёрсткой для максимальной совместимости
        const inlineHtml = `
            <!--[if mso]>
            <table cellpadding="0" cellspacing="0" border="0" style="background-color: ${signatureFormatting.table.backgroundColor}; font-family: ${signatureFormatting.table.fontFamily}; font-size: ${signatureFormatting.table.fontSize}; color: ${signatureFormatting.table.textColor};">
            <![endif]-->
            <!--[if !mso]><!-->
            <table cellpadding="0" cellspacing="0" border="0" bgcolor="${signatureFormatting.table.backgroundColor}" style="background-color: ${signatureFormatting.table.backgroundColor}; font-family: ${signatureFormatting.table.fontFamily}; font-size: ${signatureFormatting.table.fontSize}; color: ${signatureFormatting.table.textColor}; text-decoration: none;">
            <!--<![endif]-->
                <tr>
                    <td style="vertical-align: middle; padding-right: ${signatureFormatting.layout.cellPaddingRight};">
                        <img src="${signatureFormatting.logo.src}" alt="${signatureFormatting.logo.alt}" width="${signatureFormatting.logo.width}" height="${signatureFormatting.logo.height}" style="width: ${signatureFormatting.logo.width}px; height: ${signatureFormatting.logo.height}px; border: 0; display: block;">
                    </td>
                    <td style="vertical-align: middle;">
                        ${lines.map(line => `
                            <div style="margin-bottom: ${signatureFormatting.layout.lineMarginBottom}; color: ${signatureFormatting.table.textColor}; font-family: ${signatureFormatting.table.fontFamily}; font-size: ${signatureFormatting.table.fontSize};">
                                <img src="${line.icon}" alt="Иконка" width="${signatureFormatting.icon.width}" height="${signatureFormatting.icon.height}" style="width: ${signatureFormatting.icon.width}px; height: ${signatureFormatting.icon.height}px; vertical-align: middle; margin-right: ${signatureFormatting.icon.marginRight}; border: 0; display: inline;">
                                <span style="color: ${signatureFormatting.table.textColor}; vertical-align: middle;">
                                    ${line.isEmail ? `<a href="mailto:${line.text}" style="color: ${signatureFormatting.table.textColor}; text-decoration: none; font-weight: normal; pointer-events: none; cursor: default;">${line.text}</a>` :
                                     line.isWeb ? `<a href="https://${line.text}" style="color: ${signatureFormatting.table.textColor}; text-decoration: none; font-weight: normal; pointer-events: none; cursor: default;">
${line.text}</a>` :
                                     line.text}
                                </span>
                            </div>
                        `).join('')}
                    </td>
                </tr>
            </table>
            <!--[if mso]>
            </table>
            <![endif]-->
        `;

        return inlineHtml;
    }
});
