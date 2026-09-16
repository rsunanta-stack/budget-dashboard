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
        modalBtnPdf: document.getElementById("modal-btn-pdf"),
        modalBadgeStatus: document.getElementById("modal-badge-status"),
        modalDocStatus: document.getElementById("modal-doc-status"),
        
        valStatusCommittee: document.getElementById("val-status-committee"),
        valStatusSpec: document.getElementById("val-status-spec"),
        valStatusTor: document.getElementById("val-status-tor"),
        valStatusPr: document.getElementById("val-status-pr"),
        valStatusSent: document.getElementById("val-status-sent"),
        valStatusSelf: document.getElementById("val-status-self"),
        
        trackingProgressPercent: document.getElementById("tracking-progress-percent"),
        trackingProgressFill: document.getElementById("tracking-progress-fill"),
        trackingProgressSubtext: document.getElementById("tracking-progress-subtext"),
        trackingTableBody: document.getElementById("tracking-table-body"),
        trackingSearchInput: document.getElementById("tracking-search-input"),
        trackingFilterChips: document.getElementById("tracking-filter-chips"),

        themeIcon: document.getElementById("theme-icon"),
        themeLabel: document.getElementById("theme-label"),
        sidebarToggle: document.getElementById("sidebar-toggle"),
        appSidebar: document.getElementById("app-sidebar"),
        sidebarOverlay: document.getElementById("sidebar-overlay"),

        overviewSection: document.getElementById("overview-section"),
        trackingSection: document.getElementById("tracking-section"),
        datagridSection: document.getElementById("datagrid-section"),
        formsSection: document.getElementById("forms-section"),
        topbarTitle: document.getElementById("topbar-page-title"),
        topbarBreadcrumb: document.getElementById("topbar-breadcrumb")
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

    function setLoadingState() {
        if (elements.valTechBudget) elements.valTechBudget.textContent = "กำลังโหลด...";
        if (elements.valTechCount) elements.valTechCount.textContent = "- รายการ";
        if (elements.valHealthBudget) elements.valHealthBudget.textContent = "กำลังโหลด...";
        if (elements.valHealthCount) elements.valHealthCount.textContent = "- รายการ";
        if (elements.valTotalBudget) elements.valTotalBudget.textContent = "กำลังโหลด...";
        if (elements.valTotalCount) elements.valTotalCount.textContent = "- รายการ";

        if (elements.valStatusCommittee) elements.valStatusCommittee.textContent = "-";
        if (elements.valStatusSpec) elements.valStatusSpec.textContent = "-";
        if (elements.valStatusTor) elements.valStatusTor.textContent = "-";
        if (elements.valStatusPr) elements.valStatusPr.textContent = "-";
        if (elements.valStatusSent) elements.valStatusSent.textContent = "-";
        if (elements.valStatusSelf) elements.valStatusSelf.textContent = "-";

        if (elements.tableBody) {
            elements.tableBody.innerHTML = `
                <tr>
                    <td colspan="9" class="text-center" style="padding: 40px; color: var(--text-secondary);">
                        🔄 กำลังเชื่อมต่อและโหลดข้อมูลรายการครุภัณฑ์...
                    </td>
                </tr>
            `;
        }

        if (elements.trackingTableBody) {
            elements.trackingTableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center" style="padding: 35px; color: var(--text-secondary);">
                        🔄 กำลังเชื่อมต่อและโหลดข้อมูลติดตามเอกสาร...
                    </td>
                </tr>
            `;
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

        const currentTheme = document.body.getAttribute('data-theme') || (document.body.classList.contains('dark-theme') ? 'dark' : 'light');
        const isDark = currentTheme === 'dark';
        const textColor = isDark ? "#ffffff" : "#1e293b";
        const subTextColor = isDark ? "#94a3b8" : "#64748b";
        const gridColor = isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)";

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
                        backgroundColor: isDark ? ['#6366f1', '#14b8a6'] : ['#4f46e5', '#0d9488'],
                        borderWidth: 2,
                        borderColor: isDark ? '#151d2e' : '#ffffff',
                        hoverOffset: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: { color: textColor, font: { family: 'Sarabun', size: 12 }, padding: 16 }
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

        // Display all agencies/schools without slicing top 5
        const sortedSchools = Object.keys(schoolBudgets)
            .map(key => ({ name: key, budget: schoolBudgets[key] }))
            .sort((a, b) => b.budget - a.budget);

        // Vibrant Multi-color Palette for Bar Chart
        const multiColorPalette = [
            '#4f46e5', // Indigo
            '#0d9488', // Teal
            '#d97706', // Amber / Orange
            '#2563eb', // Royal Blue
            '#ec4899', // Pink
            '#8b5cf6', // Violet
            '#06b6d4', // Cyan
            '#10b981', // Emerald
            '#f97316', // Orange
            '#ef4444', // Red
            '#6366f1', // Indigo Accent
            '#14b8a6', // Teal Light
            '#f59e0b', // Amber Light
            '#3b82f6', // Sky Blue
            '#a855f7', // Purple
            '#84cc16', // Lime
            '#0284c7', // Ocean Blue
            '#e11d48', // Rose
            '#64748b'  // Slate
        ];

        const barColors = sortedSchools.map((_, idx) => multiColorPalette[idx % multiColorPalette.length]);

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
                        backgroundColor: barColors,
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
                                color: subTextColor,
                                font: { family: 'Sarabun', size: 11 },
                                callback: function(value) {
                                    return value >= 1e6 ? (value / 1e6) + 'M' : value;
                                }
                            }
                        },
                        y: {
                            grid: { display: false },
                            ticks: { color: textColor, font: { family: 'Sarabun', size: 11 } }
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

    function getDocStatusBadge(status) {
        const s = (status || '').trim();
        if (!s || s.includes('รอดำเนินการ')) {
            return {
                className: 'badge-status-pending',
                label: s || 'รอดำเนินการ (ยังไม่เริ่ม)'
            };
        }
        if (s.includes('แต่งตั้งคณะกรรมการ') || s.includes('คำสั่งแต่งตั้ง')) {
            return {
                className: 'badge-status-committee',
                label: s
            };
        }
        if (s.includes('ร่าง Spec') || s.includes('สืบราคา')) {
            return {
                className: 'badge-status-spec',
                label: s
            };
        }
        if (s.includes('TOR') || s.includes('ราคากลาง')) {
            return {
                className: 'badge-status-tor',
                label: s
            };
        }
        if (s.includes('PR Manual') || s.includes('ออก PR')) {
            return {
                className: 'badge-status-pr',
                label: s
            };
        }
        if (s.includes('ส่งส่วนพัสดุ')) {
            return {
                className: 'badge-status-sent',
                label: s
            };
        }
        if (s.includes('จัดซื้อเอง') || s.includes('ศคว.')) {
            return {
                className: 'badge-status-self',
                label: s
            };
        }
        return {
            className: 'badge-status-default',
            label: s
        };
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

        const badgeStatus = getDocStatusBadge(item.docStatus);
        if (elements.modalBadgeStatus) {
            elements.modalBadgeStatus.className = `badge ${badgeStatus.className}`;
            elements.modalBadgeStatus.textContent = badgeStatus.label;
        }
        if (elements.modalDocStatus) {
            elements.modalDocStatus.textContent = item.docStatus || 'รอดำเนินการ (ยังไม่เริ่ม)';
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
            pdfLink: 24,
            docStatus: isTech ? 26 : 25
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
            
            // Tab 1: 'วิทย์เทค(แบบแยก)' uses column AA (index 26)
            // Tab 2: 'วิทย์สุข(แบบแยก)' uses column Z (index 25)
            const docStatusCell = isTech ? cells[26] : cells[25];
            const docStatusRaw = cleanText(docStatusCell);
            const docStatus = docStatusRaw || 'รอดำเนินการ (ยังไม่เริ่ม)';

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
                    docStatus: docStatus,
                    children: []
                };

                if (items.length < 2) {
                    console.log(`[Google Sheets Parse] Mapped Row ${r+1} -> Parent Name: "${parentObj.name}", Qty: ${parentObj.quantity}, Price: ${parentObj.totalPrice} Baht, DocStatus: "${parentObj.docStatus}"`);
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
                        pdfLink: pdfLink,
                        docStatus: docStatus || (currentParent ? currentParent.docStatus : 'รอดำเนินการ (ยังไม่เริ่ม)')
                    };
                    
                    if (currentParent.children.length < 2) {
                        console.log(`[Google Sheets Parse] Mapped Row ${r+1} -> Child Name: "${childObj.name}", Qty: ${childObj.quantity}, Price: ${childObj.totalPrice} Baht, DocStatus: "${childObj.docStatus}"`);
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
        renderTracking();
    }

    function loadLocalFallback() {
        const rawTech = BUDGET_DATA.science_tech || [];
        const rawHealth = BUDGET_DATA.science_health || [];
        state.items = [
            ...rawTech.map(item => ({ ...item, category_th: "วิทยาศาสตร์และเทคโนโลยี", docStatus: item.docStatus || 'รอดำเนินการ (ยังไม่เริ่ม)' })),
            ...rawHealth.map(item => ({ ...item, category_th: "วิทยาศาสตร์สุขภาพ", docStatus: item.docStatus || 'รอดำเนินการ (ยังไม่เริ่ม)' }))
        ];
    }

    let trackingActiveFilter = '';
    let trackingSearchQuery = '';

    function renderTracking() {
        const tbody = elements.trackingTableBody || document.getElementById("tracking-table-body");
        if (!tbody) return;

        // 1. Calculate 7 Status Metrics & Progress
        const totalItems = state.items.length;
        let countPending = 0;
        let countCommittee = 0;
        let countSpec = 0;
        let countTor = 0;
        let countPr = 0;
        let countSent = 0;
        let countSelf = 0;
        let startedCount = 0;

        state.items.forEach(item => {
            const status = (item.docStatus || '').trim();
            const lower = status.toLowerCase();

            if (!status || status.includes('รอดำเนินการ')) {
                countPending++;
            } else {
                startedCount++;
                if (status.includes('ส่งส่วนพัสดุ')) {
                    countSent++;
                } else if (status.includes('จัดซื้อเอง') || status.includes('ศคว.')) {
                    countSelf++;
                } else if (status.includes('PR Manual') || status.includes('ออก PR') || lower.includes('pr')) {
                    countPr++;
                } else if (status.includes('TOR') || status.includes('ราคากลาง')) {
                    countTor++;
                } else if (status.includes('ร่าง Spec') || status.includes('สืบราคา') || lower.includes('spec')) {
                    countSpec++;
                } else if (status.includes('แต่งตั้ง') || status.includes('คณะกรรมการ')) {
                    countCommittee++;
                } else {
                    countSpec++;
                }
            }
        });

        const percent = totalItems > 0 ? ((startedCount / totalItems) * 100).toFixed(1) : "0.0";

        // Update DOM Metrics for active tracking statuses
        if (elements.valStatusCommittee) elements.valStatusCommittee.textContent = formatNumber(countCommittee);
        if (elements.valStatusSpec) elements.valStatusSpec.textContent = formatNumber(countSpec);
        if (elements.valStatusTor) elements.valStatusTor.textContent = formatNumber(countTor);
        if (elements.valStatusPr) elements.valStatusPr.textContent = formatNumber(countPr);
        if (elements.valStatusSent) elements.valStatusSent.textContent = formatNumber(countSent);
        if (elements.valStatusSelf) elements.valStatusSelf.textContent = formatNumber(countSelf);

        // Update Progress Bar
        if (elements.trackingProgressPercent) elements.trackingProgressPercent.textContent = `${percent}%`;
        if (elements.trackingProgressFill) elements.trackingProgressFill.style.width = `${percent}%`;
        if (elements.trackingProgressSubtext) {
            elements.trackingProgressSubtext.textContent = `เริ่มดำเนินการแล้ว ${formatNumber(startedCount)} จากทั้งหมด ${formatNumber(totalItems)} รายการ (${percent}%)`;
        }

        // 2. Filter & Render Tracking Table Rows
        tbody.innerHTML = '';

        const filterQuery = (trackingSearchQuery || '').toLowerCase().trim();

        const filteredRows = state.items.filter(item => {
            const itemStatus = (item.docStatus || 'รอดำเนินการ (ยังไม่เริ่ม)').toLowerCase();
            const itemName = (item.name || '').toLowerCase();
            const itemSpec = (item.specMaker || '').toLowerCase();
            const itemPriority = (item.priority || '').toString();

            // Search text matching
            const matchesSearch = !filterQuery || 
                itemName.includes(filterQuery) || 
                itemSpec.includes(filterQuery) || 
                itemStatus.includes(filterQuery) || 
                itemPriority.includes(filterQuery);

            if (!matchesSearch) return false;

            // Status chip filter matching for all 7 statuses
            if (!trackingActiveFilter) return true;
            if (trackingActiveFilter === 'pending') {
                return itemStatus.includes('รอดำเนินการ') || !item.docStatus;
            }
            if (trackingActiveFilter === 'committee') {
                return itemStatus.includes('แต่งตั้ง') || itemStatus.includes('คณะกรรมการ');
            }
            if (trackingActiveFilter === 'spec') {
                return itemStatus.includes('spec') || itemStatus.includes('สืบราคา');
            }
            if (trackingActiveFilter === 'tor') {
                return itemStatus.includes('tor') || itemStatus.includes('ราคากลาง');
            }
            if (trackingActiveFilter === 'pr') {
                return itemStatus.includes('pr') || itemStatus.includes('ออก pr');
            }
            if (trackingActiveFilter === 'sent') {
                return itemStatus.includes('ส่งส่วนพัสดุ');
            }
            if (trackingActiveFilter === 'self') {
                return itemStatus.includes('จัดซื้อเอง') || itemStatus.includes('ศคว.');
            }
            return true;
        });

        if (filteredRows.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center" style="padding: 35px; color: var(--text-secondary);">
                        ❌ ไม่พบรายการติดตามเอกสารที่ตรงกับเงื่อนไข
                    </td>
                </tr>
            `;
            return;
        }

        filteredRows.forEach(item => {
            const row = document.createElement("tr");
            row.className = "table-row-parent table-row-item";
            row.dataset.id = item.id;

            const isTech = item.type === 'science_tech';
            const badgeTypeClass = isTech ? 'badge-tech' : 'badge-health';
            const badgeTypeLabel = isTech ? 'วิทย์-เทค' : 'วิทย์-สุข';
            const badgeStatus = getDocStatusBadge(item.docStatus);

            const hasChildren = item.children && item.children.length > 0;

            row.innerHTML = `
                <td class="text-center" style="font-weight:700; color:var(--text-secondary);">${item.priority || "-"}</td>
                <td class="text-center"><span class="badge ${badgeTypeClass}">${badgeTypeLabel}</span></td>
                <td class="parent-name-cell" style="line-height:1.5;">
                    ${hasChildren ? `
                        <span class="toggle-trigger">
                            <span class="toggle-icon">▶</span>
                        </span>
                    ` : ''}
                    <span>${item.name}</span>
                </td>
                <td>${item.specMaker || "-"}</td>
                <td class="text-center"><span class="badge ${badgeStatus.className}">${badgeStatus.label}</span></td>
            `;

            if (hasChildren) {
                const toggleTrigger = row.querySelector(".toggle-trigger");
                if (toggleTrigger) {
                    toggleTrigger.addEventListener("click", (e) => {
                        e.stopPropagation();
                        const childRows = tbody.querySelectorAll(`.tracking-child-of-${item.id}`);
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
                item.children.forEach((child, childIdx) => {
                    const childBadgeStatus = getDocStatusBadge(child.docStatus || item.docStatus);
                    const childRow = document.createElement("tr");
                    childRow.className = `table-row-child table-row-item tracking-child-of-${item.id}`;
                    childRow.style.display = "none";
                    childRow.dataset.id = child.id;
                    childRow.innerHTML = `
                        <td class="text-center" style="font-weight:600; color:var(--text-secondary); opacity: 0.85;">${item.priority}.${childIdx + 1}</td>
                        <td class="text-center"><span class="badge ${badgeTypeClass}" style="opacity: 0.75;">${badgeTypeLabel}</span></td>
                        <td style="padding-left: 28px; font-weight:500;">
                            <span style="opacity: 0.4; margin-right: 6px;">└─</span>
                            ${child.name}
                        </td>
                        <td style="opacity: 0.9;">${child.specMaker || item.specMaker || "-"}</td>
                        <td class="text-center"><span class="badge ${childBadgeStatus.className}">${childBadgeStatus.label}</span></td>
                    `;
                    childRow.addEventListener("click", () => showDetailModal(child.id));
                    tbody.appendChild(childRow);
                });
            }
        });
    }

    function initTrackingListeners() {
        if (elements.trackingSearchInput) {
            elements.trackingSearchInput.addEventListener("input", (e) => {
                trackingSearchQuery = e.target.value;
                renderTracking();
            });
        }

        if (elements.trackingFilterChips) {
            const chips = elements.trackingFilterChips.querySelectorAll(".chip");
            chips.forEach(chip => {
                chip.addEventListener("click", () => {
                    chips.forEach(c => c.classList.remove("active"));
                    chip.classList.add("active");
                    trackingActiveFilter = chip.dataset.statusFilter || '';
                    renderTracking();
                });
            });
        }

        // Allow clicking metric cards to filter table directly
        const metricCardMap = [
            { selector: '.tracking-metric-card.metric-committee', filter: 'committee' },
            { selector: '.tracking-metric-card.metric-spec', filter: 'spec' },
            { selector: '.tracking-metric-card.metric-tor', filter: 'tor' },
            { selector: '.tracking-metric-card.metric-pr', filter: 'pr' },
            { selector: '.tracking-metric-card.metric-sent', filter: 'sent' },
            { selector: '.tracking-metric-card.metric-self', filter: 'self' }
        ];

        metricCardMap.forEach(m => {
            const cardEl = document.querySelector(m.selector);
            if (cardEl) {
                cardEl.addEventListener('click', () => {
                    trackingActiveFilter = (trackingActiveFilter === m.filter) ? '' : m.filter;
                    if (elements.trackingFilterChips) {
                        const chips = elements.trackingFilterChips.querySelectorAll('.chip');
                        chips.forEach(c => {
                            if ((c.dataset.statusFilter || '') === trackingActiveFilter) {
                                c.classList.add('active');
                            } else {
                                c.classList.remove('active');
                            }
                        });
                    }
                    renderTracking();
                });
            }
        });
    }

    function getInitialTheme() {
        const saved = localStorage.getItem('cse_wu_budget_theme');
        if (saved === 'light' || saved === 'dark') return saved;
        return 'dark'; // Default to dark theme for premium aesthetics
    }

    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        document.body.setAttribute('data-theme', theme);
        if (theme === 'dark') {
            document.body.classList.add('dark-theme');
            if (elements.themeIcon) elements.themeIcon.textContent = '🌙';
            if (elements.themeLabel) elements.themeLabel.textContent = 'Dark Mode';
        } else {
            document.body.classList.remove('dark-theme');
            if (elements.themeIcon) elements.themeIcon.textContent = '☀️';
            if (elements.themeLabel) elements.themeLabel.textContent = 'Light Mode';
        }
        localStorage.setItem('cse_wu_budget_theme', theme);
    }

    function toggleTheme() {
        const current = document.body.getAttribute('data-theme') || (document.body.classList.contains('dark-theme') ? 'dark' : 'light');
        const next = current === 'dark' ? 'light' : 'dark';
        applyTheme(next);
        renderCharts();
        renderTable();
    }

    const SECTION_IDS = ['overview-section', 'tracking-section', 'datagrid-section', 'forms-section'];

    const TAB_INFO = {
        'overview-section': {
            title: 'ระบบงบลงทุนและแผนจัดซื้อจัดจ้าง 2570',
            breadcrumb: 'ศูนย์เครื่องมือวิทยาศาสตร์และเทคโนโลยี · ภาพรวมงบประมาณ'
        },
        'tracking-section': {
            title: 'กระดานติดตามสถานะการจัดทำเอกสาร',
            breadcrumb: 'ศูนย์เครื่องมือวิทยาศาสตร์และเทคโนโลยี · ติดตามสถานะ'
        },
        'datagrid-section': {
            title: 'ข้อมูลรายการครุภัณฑ์ทั้งหมด',
            breadcrumb: 'ศูนย์เครื่องมือวิทยาศาสตร์และเทคโนโลยี · รายการครุภัณฑ์'
        },
        'forms-section': {
            title: 'แบบฟอร์มการจัดซื้อ',
            breadcrumb: 'ศูนย์เครื่องมือวิทยาศาสตร์และเทคโนโลยี · แบบฟอร์มและเอกสาร'
        }
    };

    function switchTab(tabId) {
        const targetId = tabId || 'overview-section';

        // 1. Hide all SPA sections
        SECTION_IDS.forEach(id => {
            const sec = document.getElementById(id);
            if (sec) {
                sec.style.display = 'none';
            }
        });

        // 2. Show the active section
        const activeSection = document.getElementById(targetId);
        if (activeSection) {
            activeSection.style.display = targetId === 'overview-section' ? 'flex' : 'block';
        }

        // 3. Update topbar title & breadcrumb
        if (TAB_INFO[targetId]) {
            if (elements.topbarTitle) elements.topbarTitle.textContent = TAB_INFO[targetId].title;
            if (elements.topbarBreadcrumb) elements.topbarBreadcrumb.textContent = TAB_INFO[targetId].breadcrumb;
        }

        // 4. Update sidebar active state
        if (elements.appSidebar) {
            const links = elements.appSidebar.querySelectorAll('.sidebar-link');
            links.forEach(link => {
                if (link.dataset.tab === targetId) {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            });
        }

        // 5. Scroll to top smoothly
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // 6. Trigger charts resize/render if overview-section is shown
        if (targetId === 'overview-section') {
            setTimeout(() => {
                if (state.charts.share) state.charts.share.resize();
                if (state.charts.schools) state.charts.schools.resize();
            }, 60);
        }
    }

    // Expose switchTab globally for external or inline calls if needed
    window.switchTab = switchTab;

    function initSidebar() {
        if (elements.sidebarToggle && elements.appSidebar) {
            elements.sidebarToggle.addEventListener('click', () => {
                elements.appSidebar.classList.toggle('sidebar-open');
                if (elements.sidebarOverlay) {
                    elements.sidebarOverlay.classList.toggle('active');
                }
            });
        }

        if (elements.sidebarOverlay && elements.appSidebar) {
            elements.sidebarOverlay.addEventListener('click', () => {
                elements.appSidebar.classList.remove('sidebar-open');
                elements.sidebarOverlay.classList.remove('active');
            });
        }

        if (elements.appSidebar) {
            const links = elements.appSidebar.querySelectorAll('.sidebar-link');
            links.forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const tabId = link.dataset.tab || 'overview-section';
                    switchTab(tabId);

                    if (window.innerWidth <= 992) {
                        elements.appSidebar.classList.remove('sidebar-open');
                        if (elements.sidebarOverlay) elements.sidebarOverlay.classList.remove('active');
                    }
                });
            });
        }
    }

    if (elements.themeToggle) {
        elements.themeToggle.addEventListener("click", toggleTheme);
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

    async function initApp() {
        applyTheme(getInitialTheme());
        initSidebar();
        initDateHeader();
        initTimeline();
        initTrackingListeners();
        setLoadingState();

        // 1. Force await data fetch from Google Sheets (or fallback) to 100% completion
        await loadDataset();

        // 2. Render all views and populate DOM
        updateKPIs();
        initFilterOptions();
        renderTable();
        renderTracking();

        // 3. switchTab is executed at the very last step after all DOM elements are populated
        switchTab('overview-section');
    }

    initApp();
});

// Function for Forms Accordion
function toggleAccordion(btn) {
    const content = btn.nextElementSibling;
    const arrow = btn.querySelector('.icon-arrow');
    btn.classList.toggle('active');
    if (content) {
        content.classList.toggle('active');
        if (arrow) {
            arrow.textContent = content.classList.contains('active') ? '▲' : '▼';
        }
    }
}