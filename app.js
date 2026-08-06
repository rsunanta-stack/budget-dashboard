// JavaScript logic for CSE Walailak University Budget Dashboard

const SHEET_ID = "1TE7ksPMwn6xvt6yEt8j06IHvTtpfoqyLycqu0DvJmNo";
const SHEET_NAME_1 = "วิทย์เทค(แบบแยก)";
const SHEET_NAME_2 = "วิทย์สุข(แบบแยก)";

document.addEventListener("DOMContentLoaded", () => {
    
    const GOOGLE_SHEETS_CONFIG = {
        enabled: true,
        spreadsheetId: SHEET_ID,
        techSheetName: SHEET_NAME_1,
        healthSheetName: SHEET_NAME_2
    };

    const state = {
        items: [],
        filteredItems: [],
        currentPage: 1,
        pageSize: 10,
        sortColumn: null,
        sortDirection: 'asc',
        filters: {
            search: '',
            type: '',
            faculty: ''
        },
        charts: {
            share: null,
            schools: null
        }
    };

    const elements = {
        body: document.body,
        themeToggle: document.getElementById("theme-toggle"),
        dateString: document.getElementById("date-string"),
        currentDateBadge: document.getElementById("current-date-badge"),
        phaseAlertBox: document.getElementById("phase-alert-box"),
        timelineContainer: document.getElementById("timeline-container"),
        
        valTechBudget: document.getElementById("val-tech-budget"),
        valTechCount: document.getElementById("val-tech-count"),
        valHealthBudget: document.getElementById("val-health-budget"),
        valHealthCount: document.getElementById("val-health-count"),
        valTotalBudget: document.getElementById("val-total-budget"),
        valTotalCount: document.getElementById("val-total-count"),
        
        searchInput: document.getElementById("search-input"),
        filterType: document.getElementById("filter-type"),
        filterFaculty: document.getElementById("filter-faculty"),
        btnClearFilters: document.getElementById("btn-clear-filters"),
        
        tableBody: document.getElementById("table-body"),
        paginationInfo: document.getElementById("pagination-info"),
        btnPrev: document.getElementById("btn-prev"),
        btnNext: document.getElementById("btn-next"),
        
        thPriority: document.getElementById("th-priority"),
        thType: document.getElementById("th-type"),
        thName: document.getElementById("th-name"),
        thFaculty: document.getElementById("th-faculty"),
        thQty: document.getElementById("th-qty"),
        thPrice: document.getElementById("th-price"),
        thTotal: document.getElementById("th-total"),
        thRequester: document.getElementById("th-requester"),
        thSpecMaker: document.getElementById("th-specmaker"),
        
        modalDetail: document.getElementById("modal-detail"),
        modalCloseBtn: document.getElementById("modal-close-btn"),
        modalBadgeType: document.getElementById("modal-badge-type"),
        modalItemName: document.getElementById("modal-item-name"),
        modalFaculty: document.getElementById("modal-faculty"),
        modalDepartment: document.getElementById("modal-department"),
        modalQty: document.getElementById("modal-qty"),
        modalTotalPrice: document.getElementById("modal-total-price"),
        modalLocation: document.getElementById("modal-location"),
        modalRequester: document.getElementById("modal-requester"),
        modalSpecMaker: document.getElementById("modal-spec-maker"),
        modalNeedType: document.getElementById("modal-need-type"),
        modalExistingStatus: document.getElementById("modal-existing-status"),
        modalNeedDetail: document.getElementById("modal-need-detail"),
        modalQuotesGrid: document.getElementById("modal-quotes-grid"),
        modalBtnPdf: document.getElementById("modal-btn-pdf")
    };

    const TODAY = new Date();

    function formatCurrency(amount) {
        return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(amount);
    }

    function formatNumber(num) {
        return new Intl.NumberFormat('th-TH').format(num);
    }

    function naturalCompare(a, b) {
        return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
    }

    function initDateHeader() {
        const thaiMonths = [
            "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
            "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
        ];
        const day = TODAY.getDate();
        const month = thaiMonths[TODAY.getMonth()];
        const year = TODAY.getFullYear() + 543;
        if (elements.dateString) {
            elements.dateString.textContent = `${day} ${month} ${year}`;
        }
    }

    function initTimeline() {
        if (elements.timelineContainer) {
            elements.timelineContainer.innerHTML = '';
        }
        let activeStep = null;
        let activeStepIndex = -1;

        const todayMidnight = new Date(TODAY.getTime());
        todayMidnight.setHours(0, 0, 0, 0);

        TIMELINE_DATA.forEach((step, idx) => {
            const stepEl = document.createElement("div");
            stepEl.className = "timeline-step";
            
            const start = new Date(step.startDate);
            start.setHours(0, 0, 0, 0);
            
            const end = new Date(step.endDate);
            end.setHours(0, 0, 0, 0);
            
            let status = "pending";
            
            if (todayMidnight > end) {
                status = "completed";
                stepEl.classList.add("completed");
            } else if (todayMidnight >= start && todayMidnight <= end) {
                status = "active";
                stepEl.classList.add("active");
                activeStep = step;
                activeStepIndex = idx;
            }

            stepEl.innerHTML = `
                <div class="step-num">${step.id}</div>
                <div class="step-date">${step.date}</div>
                <div class="step-title">${step.title}</div>
                <div class="step-desc">${step.detail}</div>
            `;
            if (elements.timelineContainer) {
                elements.timelineContainer.appendChild(stepEl);
            }
        });

        if (activeStepIndex !== -1) {
            setTimeout(() => {
                if (elements.timelineContainer) {
                    const scrollOffset = activeStepIndex * 266 - (elements.timelineContainer.clientWidth / 2) + 125;
                    elements.timelineContainer.scrollLeft = Math.max(0, scrollOffset);
                }
            }, 100);

            if (elements.phaseAlertBox) {
                elements.phaseAlertBox.innerHTML = `
                    <strong>ขั้นตอนปัจจุบัน:</strong> ขั้นตอนที่ ${activeStep.id} - ${activeStep.title} (${activeStep.date})<br>
                    <span style="font-size: 0.85rem; opacity: 0.9;">รายละเอียด: ${activeStep.detail}</span>
                `;
            }
        } else {
            if (elements.phaseAlertBox) {
                elements.phaseAlertBox.innerHTML = `
                    <strong>สถานะระบบ:</strong> นอกเหนือระยะเวลาแผนงานจัดซื้อจัดจ้างงบลงทุนปี 2570 แล้ว<br>
                    <span style="font-size: 0.85rem; opacity: 0.9;">สืบค้นประวัติขั้นตอนโดยการเลื่อนแถบด้านล่าง</span>
                `;
            }
        }
    }

    function updateKPIs() {
        let techBudget = 0;
        let techCount = 0;
        let healthBudget = 0;
        let healthCount = 0;

        state.items.forEach(item => {
            if (item.type === 'science_tech') {
                techBudget += item.totalPrice;
                techCount++;
            } else if (item.type === 'science_health') {
                healthBudget += item.totalPrice;
                healthCount++;
            }
        });

        const totalBudget = techBudget + healthBudget;
        const totalCount = techCount + healthCount;

        if (elements.valTechBudget) elements.valTechBudget.textContent = formatCurrency(techBudget);
        if (elements.valTechCount) elements.valTechCount.textContent = `${formatNumber(techCount)} รายการ`;
        
        if (elements.valHealthBudget) elements.valHealthBudget.textContent = formatCurrency(healthBudget);
        if (elements.valHealthCount) elements.valHealthCount.textContent = `${formatNumber(healthCount)} รายการ`;

        if (elements.valTotalBudget) elements.valTotalBudget.textContent = formatCurrency(totalBudget);
        if (elements.valTotalCount) elements.valTotalCount.textContent = `${formatNumber(totalCount)} รายการ`;
    }

    function initFilterOptions() {
        if (!elements.filterFaculty) return;
        elements.filterFaculty.innerHTML = '<option value="">-- หน่วยงานทั้งหมด --</option>';
        const faculties = new Set();

        state.items.forEach(item => {
            if (item.faculty) faculties.add(item.faculty);
            if (item.children) {
                item.children.forEach(child => {
                    if (child.faculty) faculties.add(child.faculty);
                });
            }
        });

        Array.from(faculties).sort().forEach(fac => {
            const opt = document.createElement("option");
            opt.value = fac;
            opt.textContent = fac;
            elements.filterFaculty.appendChild(opt);
        });
    }

    function renderCharts() {
        if (state.charts.share) state.charts.share.destroy();
        if (state.charts.schools) state.charts.schools.destroy();

        const isDark = elements.body ? elements.body.classList.contains("dark-theme") : true;
        const textColor = isDark ? "#ECEAF5" : "#2d2645";
        const gridColor = isDark ? "rgba(126, 101, 194, 0.12)" : "rgba(89, 69, 140, 0.08)";

        let techSum = 0;
        let healthSum = 0;
        state.filteredItems.forEach(item => {
            if (item.type === 'science_tech') techSum += item.totalPrice;
            else healthSum += item.totalPrice;
        });

        const shareCanvas = document.getElementById("chart-share");
        if (shareCanvas) {
            const shareCtx = shareCanvas.getContext("2d");
            state.charts.share = new Chart(shareCtx, {
                type: 'pie',
                data: {
                    labels: ['วิทยาศาสตร์และเทคโนโลยี', 'วิทยาศาสตร์สุขภาพ'],
                    datasets: [{
                        data: [techSum, healthSum],
                        backgroundColor: ['#7E65C2', '#E37222'],
                        borderWidth: isDark ? 2 : 1,
                        borderColor: isDark ? '#13111d' : '#ffffff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: { color: textColor, font: { family: 'Sarabun' } }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return ` ${context.label}: ${formatCurrency(context.raw)}`;
                                }
                            }
                        }
                    }
                }
            });
        }

        const schoolBudgets = {};
        state.filteredItems.forEach(item => {
            if (item.filteredChildren && item.filteredChildren.length > 0) {
                item.filteredChildren.forEach(child => {
                    if (!child.faculty) return;
                    schoolBudgets[child.faculty] = (schoolBudgets[child.faculty] || 0) + child.totalPrice;
                });
            } else {
                if (!item.faculty) return;
                schoolBudgets[item.faculty] = (schoolBudgets[item.faculty] || 0) + item.totalPrice;
            }
        });

        const sortedSchools = Object.keys(schoolBudgets)
            .map(key => ({ name: key, budget: schoolBudgets[key] }))
            .sort((a, b) => b.budget - a.budget)
            .slice(0, 5);

        const schoolsCanvas = document.getElementById("chart-schools");
        if (schoolsCanvas) {
            const schoolsCtx = schoolsCanvas.getContext("2d");
            state.charts.schools = new Chart(schoolsCtx, {
                type: 'bar',
                data: {
                    labels: sortedSchools.map(s => s.name),
                    datasets: [{
                        label: 'งบประมาณรวม (บาท)',
                        data: sortedSchools.map(s => s.budget),
                        backgroundColor: '#F1B521',
                        borderRadius: 6
                    }]
                },
                options: {
                    indexAxis: 'y',
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return ` ${formatCurrency(context.raw)}`;
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            grid: { color: gridColor },
                            ticks: {
                                color: textColor,
                                font: { family: 'Sarabun', size: 10 },
                                callback: function(value) {
                                    return value >= 1e6 ? (value / 1e6) + 'M' : value;
                                }
                            }
                        },
                        y: {
                            grid: { display: false },
                            ticks: { color: textColor, font: { family: 'Sarabun', size: 10 } }
                        }
                    }
                }
            });
        }
    }

    function renderTable() {
        const tbody = elements.tableBody;
        if (!tbody) return;
        tbody.innerHTML = '';

        state.filteredItems = state.items.map(parent => {
            const searchLower = state.filters.search.toLowerCase();
            
            const matchesParentSearch = !state.filters.search || 
                parent.name.toLowerCase().includes(searchLower) ||
                parent.requester.toLowerCase().includes(searchLower) ||
                parent.specMaker.toLowerCase().includes(searchLower) ||
                parent.location.toLowerCase().includes(searchLower);

            const matchingChildren = parent.children ? parent.children.filter(child => {
                return !state.filters.search || 
                    child.name.toLowerCase().includes(searchLower) ||
                    child.requester.toLowerCase().includes(searchLower) ||
                    child.specMaker.toLowerCase().includes(searchLower) ||
                    child.location.toLowerCase().includes(searchLower);
            }) : [];

            const hasMatchingChildren = matchingChildren.length > 0;
            const matchesSearch = matchesParentSearch || hasMatchingChildren;

            const matchesType = !state.filters.type || parent.type === state.filters.type;

            const matchesFaculty = !state.filters.faculty || 
                parent.faculty === state.filters.faculty || 
                (parent.children && parent.children.some(child => child.faculty === state.filters.faculty));

            if (matchesSearch && matchesType && matchesFaculty) {
                const finalChildren = state.filters.faculty 
                    ? parent.children.filter(c => c.faculty === state.filters.faculty)
                    : (hasMatchingChildren ? matchingChildren : parent.children);

                return {
                    ...parent,
                    filteredChildren: finalChildren
                };
            }
            return null;
        }).filter(item => item !== null);

        if (state.sortColumn) {
            state.filteredItems.sort((a, b) => {
                let valA = a[state.sortColumn];
                let valB = b[state.sortColumn];

                if (state.sortColumn === 'priority') {
                    valA = valA ? valA.toString() : "";
                    valB = valB ? valB.toString() : "";
                    return state.sortDirection === 'asc' 
                        ? naturalCompare(valA, valB) 
                        : naturalCompare(valB, valA);
                }

                if (typeof valA === 'string') {
                    return state.sortDirection === 'asc' 
                        ? valA.localeCompare(valB, 'th') 
                        : valB.localeCompare(valA, 'th');
                }
                
                return state.sortDirection === 'asc' ? valA - valB : valB - valA;
            });
        }

        const totalItems = state.filteredItems.length;
        const totalPages = Math.ceil(totalItems / state.pageSize) || 1;
        
        if (state.currentPage > totalPages) state.currentPage = totalPages;
        if (state.currentPage < 1) state.currentPage = 1;

        const startIndex = (state.currentPage - 1) * state.pageSize;
        const endIndex = Math.min(startIndex + state.pageSize, totalItems);
        const paginatedItems = state.filteredItems.slice(startIndex, endIndex);

        if (paginatedItems.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="9" class="text-center" style="padding: 40px; color: var(--text-secondary);">
                        ❌ ไม่พบรายการที่ตรงกับตัวกรองที่เลือก
                    </td>
                </tr>
            `;
        } else {
            paginatedItems.forEach((item) => {
                const row = document.createElement("tr");
                row.className = "table-row-parent table-row-item";
                row.dataset.id = item.id;
                
                const badgeClass = item.type === 'science_tech' ? 'badge-tech' : 'badge-health';
                const badgeLabel = item.type === 'science_tech' ? 'วิทย์-เทค' : 'วิทย์-สุข';
                
                const hasChildren = item.filteredChildren && item.filteredChildren.length > 0;

                row.innerHTML = `
                    <td class="text-center" style="font-weight:700; color:var(--text-secondary);">${item.priority || "-"}</td>
                    <td class="text-center"><span class="badge ${badgeClass}">${badgeLabel}</span></td>
                    <td class="parent-name-cell" style="line-height:1.5;">
                        ${hasChildren ? `
                            <span class="toggle-trigger">
                                <span class="toggle-icon">▶</span>
                            </span>
                        ` : ''}
                        <span>${item.name}</span>
                    </td>
                    <td>${item.faculty || "-"}</td>
                    <td class="text-center">${item.quantity} ${item.unit}</td>
                    <td class="number-col">${formatNumber(item.unitPrice)} ฿</td>
                    <td class="number-col" style="color:var(--secondary); font-weight:700;">${formatNumber(item.totalPrice)} ฿</td>
                    <td>${item.requester || "-"}</td>
                    <td>${item.specMaker || "-"}</td>
                `;

                if (hasChildren) {
                    const toggleTrigger = row.querySelector(".toggle-trigger");
                    if (toggleTrigger) {
                        toggleTrigger.addEventListener("click", (e) => {
                            e.stopPropagation();
                            
                            const childRows = tbody.querySelectorAll(`.child-of-${item.id}`);
                            const toggleIcon = row.querySelector(".toggle-icon");
                            if (toggleIcon) {
                                const isOpen = toggleIcon.classList.contains("open");
                                if (isOpen) {
                                    toggleIcon.classList.remove("open");
                                    childRows.forEach(r => r.style.display = "none");
                                } else {
                                    toggleIcon.classList.add("open");
                                    childRows.forEach(r => r.style.display = "table-row");
                                }
                            }
                        });
                    }
                }

                row.addEventListener("click", () => showDetailModal(item.id));
                tbody.appendChild(row);

                if (hasChildren) {
                    item.filteredChildren.forEach((child, childIdx) => {
                        const childRow = document.createElement("tr");
                        childRow.className = `table-row-child table-row-item child-of-${item.id}`;
                        childRow.style.display = "none";
                        childRow.dataset.id = child.id;
                        
                        childRow.innerHTML = `
                            <td class="text-center" style="font-weight:600; color:var(--text-secondary); opacity: 0.85;">${item.priority}.${childIdx + 1}</td>
                            <td class="text-center"><span class="badge ${badgeClass}" style="opacity: 0.75;">${badgeLabel}</span></td>
                            <td style="padding-left: 28px; font-weight:500;">
                                <span style="opacity: 0.4; margin-right: 6px;">└─</span>
                                ${child.name}
                            </td>
                            <td>${child.faculty || "-"}</td>
                            <td class="text-center" style="opacity: 0.9;">${child.quantity} ${child.unit}</td>
                            <td class="number-col" style="opacity: 0.9;">${formatNumber(child.unitPrice)} ฿</td>
                            <td class="number-col" style="font-weight:600; color:var(--text-primary);">${formatNumber(child.totalPrice)} ฿</td>
                            <td style="opacity: 0.9;">${child.requester || "-"}</td>
                            <td style="opacity: 0.9;">${child.specMaker || "-"}</td>
                        `;
                        
                        childRow.addEventListener("click", () => showDetailModal(child.id));
                        tbody.appendChild(childRow);
                    });
                }
            });
        }

        if (elements.paginationInfo) {
            elements.paginationInfo.textContent = totalItems > 0 
                ? `กำลังแสดงรายการที่ ${startIndex + 1}-${endIndex} จากทั้งหมด ${formatNumber(totalItems)} รายการหลัก`
                : `กำลังแสดงรายการที่ 0-0 จากทั้งหมด 0 รายการหลัก`;
        }

        if (elements.btnPrev) elements.btnPrev.disabled = state.currentPage === 1;
        if (elements.btnNext) elements.btnNext.disabled = state.currentPage === totalPages || totalItems === 0;

        updateSortHeaders();
        renderCharts();
    }

    function updateSortHeaders() {
        const headers = [
            { th: elements.thPriority, col: 'priority' },
            { th: elements.thType, col: 'type' },
            { th: elements.thName, col: 'name' },
            { th: elements.thFaculty, col: 'faculty' },
            { th: elements.thQty, col: 'quantity' },
            { th: elements.thPrice, col: 'unitPrice' },
            { th: elements.thTotal, col: 'totalPrice' },
            { th: elements.thRequester, col: 'requester' },
            { th: elements.thSpecMaker, col: 'specMaker' }
        ];

        headers.forEach(h => {
            if (h.th) {
                h.th.classList.remove('sorted-asc', 'sorted-desc');
                if (state.sortColumn === h.col) {
                    h.th.classList.add(state.sortDirection === 'asc' ? 'sorted-asc' : 'sorted-desc');
                }
            }
        });
    }

    function showDetailModal(itemId) {
        let item = state.items.find(i => i.id === itemId);
        
        if (!item) {
            for (const parent of state.items) {
                const child = parent.children.find(c => c.id === itemId);
                if (child) {
                    item = child;
                    break;
                }
            }
        }
        
        if (!item) return;

        if (elements.modalItemName) elements.modalItemName.textContent = item.name;
        if (elements.modalFaculty) elements.modalFaculty.textContent = item.faculty || "-";
        if (elements.modalDepartment) elements.modalDepartment.textContent = item.department || "-";
        if (elements.modalQty) elements.modalQty.textContent = `${item.quantity} ${item.unit}`;
        if (elements.modalTotalPrice) elements.modalTotalPrice.textContent = `${formatNumber(item.totalPrice)} ฿`;
        if (elements.modalLocation) elements.modalLocation.textContent = item.location || "-";
        if (elements.modalRequester) elements.modalRequester.textContent = item.requester || "-";
        if (elements.modalSpecMaker) elements.modalSpecMaker.textContent = item.specMaker || "-";
        if (elements.modalNeedType) elements.modalNeedType.textContent = item.needType || "-";
        if (elements.modalExistingStatus) elements.modalExistingStatus.textContent = `${item.existingStatus || "-"} ${item.existingQty ? `(${item.existingQty})` : ""}`;
        if (elements.modalNeedDetail) elements.modalNeedDetail.textContent = item.needDetail || "ไม่ได้ระบุคำอธิบายเพิ่มเติม";

        const isTech = item.type === 'science_tech';
        if (elements.modalBadgeType) {
            elements.modalBadgeType.className = isTech ? 'badge badge-tech' : 'badge badge-health';
            elements.modalBadgeType.textContent = isTech ? 'วิทยาศาสตร์และเทคโนโลยี' : 'วิทยาศาสตร์สุขภาพ';
        }

        const quotes = [];
        if (item.vendor1) quotes.push({ name: item.vendor1, price: item.price1 });
        if (item.vendor2) quotes.push({ name: item.vendor2, price: item.price2 });
        if (item.vendor3) quotes.push({ name: item.vendor3, price: item.price3 });

        if (elements.modalQuotesGrid) {
            elements.modalQuotesGrid.innerHTML = '';
            if (quotes.length === 0) {
                elements.modalQuotesGrid.innerHTML = `<div style="grid-column: 1/-1; color:var(--text-secondary); text-align:center; padding: 10px;">ไม่มีข้อมูลใบเสนอราคาเปรียบเทียบ</div>`;
            } else {
                const validPrices = quotes.filter(q => q.price > 0);
                const lowestPrice = validPrices.length > 0 ? Math.min(...validPrices.map(q => q.price)) : Infinity;

                quotes.forEach(q => {
                    const card = document.createElement("div");
                    const isLowest = q.price > 0 && q.price === lowestPrice;
                    card.className = `quote-card ${isLowest ? 'lowest' : ''}`;
                    
                    card.innerHTML = `
                        <div class="quote-vendor">${q.name}</div>
                        <div class="quote-price">
                            <span>${q.price > 0 ? `${formatNumber(q.price)} ฿` : "-"}</span>
                            ${isLowest ? '<span class="lowest-badge">ราคาต่ำสุด</span>' : ''}
                        </div>
                    `;
                    elements.modalQuotesGrid.appendChild(card);
                });
            }
        }

        if (elements.modalBtnPdf) {
            let currentLink = item.pdfLink;
            if (!currentLink && item.children && item.children.length > 0) {
                currentLink = item.children.find(c => c.pdfLink)?.pdfLink;
            }

            if (currentLink) {
                let formattedLink = currentLink;
                if (!formattedLink.toLowerCase().startsWith('http')) {
                    formattedLink = 'https://' + formattedLink;
                }
                elements.modalBtnPdf.href = formattedLink;
                elements.modalBtnPdf.style.display = 'flex';
            } else {
                elements.modalBtnPdf.style.display = 'none';
            }
        }

        if (elements.modalDetail) {
            elements.modalDetail.classList.add("active");
        }
    }

    function closeModal() {
        if (elements.modalDetail) {
            elements.modalDetail.classList.remove("active");
        }
    }

    async function fetchSheetData(spreadsheetId, sheetName) {
        const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:json&tq=&sheet=${encodeURIComponent(sheetName)}&t=${Date.now()}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const text = await res.text();
        
        const jsonString = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
        const data = JSON.parse(jsonString);
        
        console.log(`[Google Sheets Raw Data] Sheet Tab Name: "${sheetName}"`, data);
        
        return data.table;
    }

    function cleanText(cell) {
        if (!cell || cell.v === null || cell.v === undefined) return "";
        return String(cell.v).trim();
    }

    function cleanNumber(cell) {
        if (!cell || cell.v === null || cell.v === undefined) return 0;
        const val = typeof cell.v === 'number' ? cell.v : parseFloat(String(cell.v).replace(/,/g, '').trim());
        return isNaN(val) ? 0 : val;
    }

    function parsePrice(cell) {
        if (!cell) return 0;
        const str = cell.f || String(cell.v !== null && cell.v !== undefined ? cell.v : "");
        const cleaned = str.replace(/,/g, '').trim();
        const val = parseFloat(cleaned);
        return isNaN(val) ? 0 : val;
    }

    function parseSheetTable(table, isTech) {
        const items = [];
        let currentParent = null;
        const rows = table.rows || [];
        
        let startIndex = 0;
        for (let i = 0; i < rows.length; i++) {
            const r = rows[i];
            if (!r || !r.c) continue;
            const cells = r.c;
            
            const priority = cleanText(cells[0]);
            const name = cleanText(cells[3]);
            const qty = cleanNumber(cells[5]);
            
            const isNumeric = priority !== "" && !isNaN(parseFloat(priority)) && isFinite(priority);
            if (isNumeric && name && qty > 0) {
                startIndex = i;
                console.log(`[Google Sheets] Item data starts at Row ${startIndex + 1} for ${isTech ? 'Tech' : 'Health'}`);
                break;
            }
        }

        console.log(`[Google Sheets Mapping Info] Tab: "${isTech ? 'Tech' : 'Health'}" indices used:`, {
            priority: 0,
            agencyNo: 1,
            category: 2,
            name: 3,
            unit: 4,
            quantity: 5,
            unitPrice: 6,
            totalPrice: 7,
            requester: 19,
            specMaker: 20,
            department: 21,
            image: 22,
            faculty: 23,
            pdfLink: 24
        });

        for (let r = startIndex; r < rows.length; r++) {
            const row = rows[r];
            if (!row || !row.c) continue;

            const cells = row.c;
            const priority = cleanText(cells[0]);
            const name = cleanText(cells[3]);
            const qty = cleanNumber(cells[5]);

            if (!name || qty <= 0) continue;

            const lowerName = name.toLowerCase();
            if (lowerName.includes("รวมทั้งหมด") || 
                lowerName.includes("หมายเหตุ") || 
                lowerName.includes("สำนักวิชา") || 
                lowerName.includes("ศูนย์เครื่องมือ") ||
                lowerName.includes("ตั้งงบรวมกัน") ||
                lowerName.includes("ข้อเสนอแนะ") ||
                lowerName.includes("ตารางสรุป") ||
                lowerName.includes("หน่วยงาน") ||
                lowerName.includes("คำขอตั้งงบประมาณ")) {
                continue;
            }

            const agencyNo = cleanText(cells[1]);
            const category = cleanText(cells[2]);
            const unit = cleanText(cells[4]);
            
            const unitPrice = parsePrice(cells[6]);
            const totalPrice = parsePrice(cells[7]) || (qty * unitPrice);

            const existingStatus = cleanText(cells[8]);
            const existingQty = cleanText(cells[9]);
            const needType = cleanText(cells[10]);
            const needDetail = cleanText(cells[11]);
            const location = cleanText(cells[12]);
            const vendor1 = cleanText(cells[13]);
            const price1 = parsePrice(cells[14]);
            const vendor2 = cleanText(cells[15]);
            const price2 = parsePrice(cells[16]);
            const vendor3 = cleanText(cells[17]);
            const price3 = parsePrice(cells[18]);
            const requester = cleanText(cells[19]);

            const specMaker = cleanText(cells[20]);
            const department = cleanText(cells[21]);
            const image = cleanText(cells[22]);
            const faculty = cleanText(cells[23]);
            const pdfLink = cleanText(cells[24]);

            const isParent = priority !== "" && !isNaN(parseFloat(priority)) && isFinite(priority);

            if (isParent) {
                const parentObj = {
                    id: `${isTech ? 'tech' : 'health'}-${r + 1}`,
                    type: isTech ? "science_tech" : "science_health",
                    category_th: isTech ? "วิทยาศาสตร์และเทคโนโลยี" : "วิทยาศาสตร์สุขภาพ",
                    priority: priority,
                    agencyNo: agencyNo,
                    category: category,
                    name: name,
                    unit: unit,
                    quantity: qty,
                    unitPrice: unitPrice,
                    totalPrice: totalPrice,
                    existingStatus: existingStatus,
                    existingQty: existingQty,
                    needType: needType,
                    needDetail: needDetail,
                    location: location,
                    vendor1: vendor1,
                    price1: price1,
                    vendor2: vendor2,
                    price2: price2,
                    vendor3: vendor3,
                    price3: price3,
                    requester: requester,
                    specMaker: specMaker,
                    department: department,
                    image: image,
                    faculty: faculty,
                    pdfLink: pdfLink,
                    children: []
                };

                if (items.length < 2) {
                    console.log(`[Google Sheets Parse] Mapped Row ${r+1} -> Parent Name: "${parentObj.name}", Qty: ${parentObj.quantity}, Price: ${parentObj.totalPrice} Baht`);
                }

                currentParent = parentObj;
                items.push(parentObj);
            } else {
                if (currentParent) {
                    let childUnitPrice = unitPrice;
                    if (childUnitPrice === 0) {
                        childUnitPrice = currentParent.unitPrice;
                    }
                    let childTotalPrice = totalPrice;
                    if (childTotalPrice === 0) {
                        childTotalPrice = qty * childUnitPrice;
                    }

                    const childObj = {
                        id: `${isTech ? 'tech' : 'health'}-${r + 1}`,
                        type: isTech ? "science_tech" : "science_health",
                        priority: priority,
                        agencyNo: agencyNo,
                        category: category,
                        name: name,
                        unit: unit,
                        quantity: qty,
                        unitPrice: childUnitPrice,
                        totalPrice: childTotalPrice,
                        existingStatus: existingStatus,
                        existingQty: existingQty,
                        needType: needType,
                        needDetail: needDetail,
                        location: location,
                        vendor1: vendor1,
                        price1: price1,
                        vendor2: vendor2,
                        price2: price2,
                        vendor3: vendor3,
                        price3: price3,
                        requester: requester,
                        specMaker: specMaker || currentParent.specMaker,
                        department: department,
                        image: image,
                        faculty: faculty,
                        pdfLink: pdfLink
                    };
                    
                    if (currentParent.children.length < 2) {
                        console.log(`[Google Sheets Parse] Mapped Row ${r+1} -> Child Name: "${childObj.name}", Qty: ${childObj.quantity}, Price: ${childObj.totalPrice} Baht`);
                    }

                    currentParent.children.push(childObj);
                }
            }
        }
        
        console.log(`[Google Sheets] Clean parsed items count for ${isTech ? 'Tech' : 'Health'}: ${items.length} main items`);
        return items;
    }

    async function loadDataset() {
        if (GOOGLE_SHEETS_CONFIG.enabled && GOOGLE_SHEETS_CONFIG.spreadsheetId) {
            try {
                console.log(`[Google Sheets] Starting load... SHEET_ID: ${GOOGLE_SHEETS_CONFIG.spreadsheetId}`);
                console.log(`[Google Sheets] Target tabs: "${GOOGLE_SHEETS_CONFIG.techSheetName}" and "${GOOGLE_SHEETS_CONFIG.healthSheetName}"`);
                
                if (elements.phaseAlertBox) {
                    elements.phaseAlertBox.innerHTML += `<div id="gs-loading-status" style="font-size:0.8rem; font-weight:600; color:var(--primary); margin-top:6px; animation: blink 1.2s infinite alternate;">🔄 กำลังเชื่อมต่อระบบและดึงข้อมูลสดจาก Google Sheets...</div>`;
                }
                
                const techTable = await fetchSheetData(GOOGLE_SHEETS_CONFIG.spreadsheetId, GOOGLE_SHEETS_CONFIG.techSheetName);
                console.log(`[Google Sheets] Tech Sheet loaded. Total rows: ${techTable.rows ? techTable.rows.length : 0}`);
                
                const healthTable = await fetchSheetData(GOOGLE_SHEETS_CONFIG.spreadsheetId, GOOGLE_SHEETS_CONFIG.healthSheetName);
                console.log(`[Google Sheets] Health Sheet loaded. Total rows: ${healthTable.rows ? healthTable.rows.length : 0}`);

                const techItems = parseSheetTable(techTable, true);
                const healthItems = parseSheetTable(healthTable, false);

                state.items = [...techItems, ...healthItems];
                console.log(`[Google Sheets] Total combined items parsed: ${state.items.length}`);
                
                initTimeline();
                
                if (elements.phaseAlertBox) {
                    elements.phaseAlertBox.innerHTML += `<div style="font-size:0.8rem; font-weight:600; color:#2ec4b6; margin-top:4px;">✅ ดึงข้อมูลสดจาก Google Sheets สำเร็จ! (วิทย์-เทค: ${techItems.length} รายการ, วิทย์-สุข: ${healthItems.length} รายการ)</div>`;
                }
            } catch (err) {
                console.error("Google Sheets fetch failed! Falling back to data.js:", err);
                loadLocalFallback();
                initTimeline();
                if (elements.phaseAlertBox) {
                    elements.phaseAlertBox.innerHTML += `<div style="font-size:0.8rem; font-weight:600; color:var(--badge-health-text); margin-top:6px;">⚠️ การเชื่อมต่อ Google Sheets ล้มเหลว (กำลังแสดงข้อมูลแบบออฟไลน์สำรอง) <br><small>รายละเอียดข้อผิดพลาด: ${err.message}</small></div>`;
                }
            }
        } else {
            loadLocalFallback();
        }

        state.filteredItems = [...state.items];
        updateKPIs();
        initFilterOptions();
        renderTable();
    }

    function loadLocalFallback() {
        const rawTech = BUDGET_DATA.science_tech || [];
        const rawHealth = BUDGET_DATA.science_health || [];
        state.items = [
            ...rawTech.map(item => ({ ...item, category_th: "วิทยาศาสตร์และเทคโนโลยี" })),
            ...rawHealth.map(item => ({ ...item, category_th: "วิทยาศาสตร์สุขภาพ" }))
        ];
    }

    if (elements.themeToggle) {
        elements.themeToggle.addEventListener("click", () => {
            if (elements.body) {
                elements.body.classList.toggle("dark-theme");
                const isDark = elements.body.classList.contains("dark-theme");
                const thumb = elements.themeToggle.querySelector(".theme-switch-thumb");
                if (thumb) thumb.textContent = isDark ? "🌙" : "☀️";
            }
            renderTable();
        });
    }

    if (elements.modalCloseBtn) {
        elements.modalCloseBtn.addEventListener("click", closeModal);
    }
    if (elements.modalDetail) {
        elements.modalDetail.addEventListener("click", (e) => {
            if (e.target === elements.modalDetail) closeModal();
        });
    }

    if (elements.btnPrev) {
        elements.btnPrev.addEventListener("click", () => {
            if (state.currentPage > 1) {
                state.currentPage--;
                renderTable();
            }
        });
    }

    if (elements.btnNext) {
        elements.btnNext.addEventListener("click", () => {
            const totalPages = Math.ceil(state.filteredItems.length / state.pageSize);
            if (state.currentPage < totalPages) {
                state.currentPage++;
                renderTable();
            }
        });
    }

    if (elements.thPriority) elements.thPriority.addEventListener("click", () => handleSort('priority'));
    if (elements.thType) elements.thType.addEventListener("click", () => handleSort('type'));
    if (elements.thName) elements.thName.addEventListener("click", () => handleSort('name'));
    if (elements.thFaculty) elements.thFaculty.addEventListener("click", () => handleSort('faculty'));
    if (elements.thQty) elements.thQty.addEventListener("click", () => handleSort('quantity'));
    if (elements.thPrice) elements.thPrice.addEventListener("click", () => handleSort('unitPrice'));
    if (elements.thTotal) elements.thTotal.addEventListener("click", () => handleSort('totalPrice'));
    if (elements.thRequester) elements.thRequester.addEventListener("click", () => handleSort('requester'));
    if (elements.thSpecMaker) {
        elements.thSpecMaker.addEventListener("click", () => handleSort('specMaker'));
    }

    if (elements.searchInput) {
        elements.searchInput.addEventListener("input", (e) => {
            state.filters.search = e.target.value;
            state.currentPage = 1;
            renderTable();
        });
    }

    if (elements.filterType) {
        elements.filterType.addEventListener("change", (e) => {
            state.filters.type = e.target.value;
            state.currentPage = 1;
            renderTable();
        });
    }

    if (elements.filterFaculty) {
        elements.filterFaculty.addEventListener("change", (e) => {
            state.filters.faculty = e.target.value;
            state.currentPage = 1;
            renderTable();
        });
    }

    if (elements.btnClearFilters) {
        elements.btnClearFilters.addEventListener("click", () => {
            if (elements.searchInput) elements.searchInput.value = '';
            if (elements.filterType) elements.filterType.value = '';
            if (elements.filterFaculty) elements.filterFaculty.value = '';
            
            state.filters.search = '';
            state.filters.type = '';
            state.filters.faculty = '';
            
            state.sortColumn = null;
            state.currentPage = 1;
            renderTable();
        });
    }

    initDateHeader();
    initTimeline();
    loadDataset();
});

// Function for Forms Accordion
function toggleAccordion(btn) {
    const content = btn.nextElementSibling;
    const arrow = btn.querySelector('.icon-arrow');
    
    // Toggle active classes
    btn.classList.toggle('active');
    content.classList.toggle('active');
    
    // Change arrow direction
    if (content.classList.contains('active')) {
        arrow.textContent = '▲';
    } else {
        arrow.textContent = '▼';
    }
}