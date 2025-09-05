document.addEventListener('DOMContentLoaded', () => {
        // --- DOM Elements ---
        const body = document.body;
        const buscadorSection = document.querySelector('.buscador');
        const facultadesSection = document.querySelector('.facultades');
        const facultadesGrid = document.getElementById('facultades-grid');
        const selectedContainer = document.getElementById('selected-facultad-container');
        const cursosSection = document.querySelector('.cursos');
        const diplomadosSection = document.querySelector('.diplomados');
        const searchForm = document.getElementById('search-form');
        const searchInput = document.getElementById('search-input');
        const searchCategory = document.getElementById('search-category');

        const allFacultades = Array.from(facultadesGrid.querySelectorAll('.facultad-card'));
        const allContentCards = Array.from(document.querySelectorAll('.cursos-grid .curso-card, .diplomados-grid .curso-card'));

        let currentFacultyFilter = null;

        // --- Main Filter Function ---
        const updateFilters = () => {
            const searchText = searchInput.value.toLowerCase().trim();
            const category = searchCategory.value;
            const isSearching = searchText !== '' || category !== 'all';
            
            let hasVisibleCourses = false;
            let hasVisibleDiplomados = false;

            allContentCards.forEach(item => {
                const itemFaculty = item.dataset.faculty;
                const itemType = item.dataset.type;
                const itemTitle = item.querySelector('h3').textContent.toLowerCase();

                const matchesFaculty = !currentFacultyFilter || itemFaculty === currentFacultyFilter;
                const matchesCategory = category === 'all' || itemType === category;
                const matchesSearch = itemTitle.includes(searchText);

                if (matchesFaculty && matchesCategory && matchesSearch) {
                    item.style.display = '';
                    if (itemType === 'curso') hasVisibleCourses = true;
                    if (itemType === 'diplomado') hasVisibleDiplomados = true;
                } else {
                    item.style.display = 'none';
                }
            });

            cursosSection.style.display = hasVisibleCourses ? '' : 'none';
            diplomadosSection.style.display = hasVisibleDiplomados ? '' : 'none';

            // --- Move Content Sections Based on Search ---
            if (isSearching && !currentFacultyFilter) {
                buscadorSection.after(diplomadosSection);
                buscadorSection.after(cursosSection);
            } else if (!isSearching && !currentFacultyFilter) {
                // Return to bottom if search is cleared and no faculty is selected
                body.appendChild(cursosSection);
                body.appendChild(diplomadosSection);
            }
        };

        // --- Event Listeners for Faculties ---
        allFacultades.forEach(card => {
            card.addEventListener('click', () => {
                const alreadySelectedCard = document.querySelector('.facultad-card.is-selected');
                
                // Clear search when a faculty is clicked to avoid conflicts
                searchInput.value = '';
                searchCategory.value = 'all';

                // --- Deselection ---
                if (alreadySelectedCard === card) {
                    alreadySelectedCard.classList.remove('is-selected');
                    facultadesGrid.appendChild(alreadySelectedCard);
                    currentFacultyFilter = null;
                    updateFilters();
                    
                    body.appendChild(cursosSection);
                    body.appendChild(diplomadosSection);
                    return;
                }

                // --- Selection ---
                if (alreadySelectedCard) {
                    alreadySelectedCard.classList.remove('is-selected');
                    facultadesGrid.appendChild(alreadySelectedCard);
                }

                card.classList.add('is-selected');
                selectedContainer.appendChild(card);
                currentFacultyFilter = card.dataset.faculty;
                updateFilters();
                
                facultadesGrid.before(cursosSection);
                facultadesGrid.before(diplomadosSection);
            });
        });

        // --- Event Listener for Search Form ---
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            updateFilters();
        });
        
        searchInput.addEventListener('keyup', updateFilters);
        searchCategory.addEventListener('change', updateFilters);
    });