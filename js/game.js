// ==========================
// ETAT DU JEU
// ==========================

const board = [
    5,5,5,5,5,5,5,   // Nord (0 → 6)
    5,5,5,5,5,5,5    // Sud (7 → 13)
];

let northScore = 0;
let southScore = 0;

let currentPlayer = "SUD";
let gameOver = false;

// Circuit Songo (boucle correcte)
const nextPit = [
    1,2,3,4,5,6,7,
    8,9,10,11,12,13,0
];

// ==========================
// UTILITAIRES CAMP
// ==========================

function isNorthPit(i){ return i >= 0 && i <= 6; }
function isSouthPit(i){ return i >= 7 && i <= 13; }

function isOpponentPit(i){
    return currentPlayer === "NORD"
        ? isSouthPit(i)
        : isNorthPit(i);
}

function displayMessage(msg){
    document.getElementById("message").textContent = msg;
}

// ==========================
// AFFICHAGE
// ==========================

function renderBoard(){

    const northRow = document.getElementById("north-row");
    const southRow = document.getElementById("south-row");

    northRow.innerHTML = "";
    southRow.innerHTML = "";

    // NORD (droite vers gauche visuellement)
for(let i = 6 ; i >= 0 ; i--){
    northRow.appendChild(createPit(i, board[i], "north"));
}

// SUD (gauche vers droite)
for(let i = 7 ; i <= 13 ; i++){
    southRow.appendChild(createPit(i, board[i], "south"));
}

    updateUI();
    highlightMoves();
}

function createPit(index, seeds, side){

    const pit = document.createElement("div");
    pit.classList.add("pit", side);

    pit.dataset.index = index;
    pit.textContent = seeds;

    pit.onclick = () => handleClick(index);

    return pit;
}

function updateUI(){
    document.getElementById("northScore").textContent = northScore;
    document.getElementById("southScore").textContent = southScore;
    document.getElementById("playerTurn").textContent = currentPlayer;
}

// ==========================
// TOUR DE JEU
// ==========================

function handleClick(index){

    if(gameOver) return;

    if(board[index] === 0){
        displayMessage("Case vide.");
        return;
    }

    if(currentPlayer === "NORD" && index > 6){
        displayMessage("Jouez dans votre camp.");
        return;
    }

    if(currentPlayer === "SUD" && index < 7){
        displayMessage("Jouez dans votre camp.");
        return;
    }

    if(!isLegalMove(index)){
        displayMessage("Coup interdit (solidarité / règle spéciale).");
        return;
    }

    playMove(index);
}

// ==========================
// DISTRIBUTION
// ==========================

function playMove(start){

    let seeds = board[start];
    board[start] = 0;

    let current = start;
    const skipOrigin = seeds > 13;

    while(seeds > 0){

        current = nextPit[current];

        if(skipOrigin && current === start){
            current = nextPit[current];
        }

        board[current]++;
        seeds--;
    }

    renderBoard();
    captureSeeds(current);
    endTurn(current);
}

// ==========================
// CAPTURES (PRISES)
// ==========================

function isCapturable(i){
    return board[i] >= 2 && board[i] <= 4;
}

function previousPit(i){
    return i === 0 ? 13 : i - 1;
}

function captureSeeds(lastPit){

    if(!isOpponentPit(lastPit)) return;

    let chain = [];
    let cur = lastPit;

    while(
        isOpponentPit(cur) &&
        isCapturable(cur)
    ){
        chain.push(cur);

        if(cur === (currentPlayer === "NORD" ? 7 : 0)){
            break;
        }

        cur = previousPit(cur);
    }

    if(chain.length === 0) return;

    if(wouldEmptyOpponent(chain)) return;

    let total = 0;

    chain.forEach(i=>{
        total += board[i];
        board[i] = 0;
    });

    if(currentPlayer === "NORD"){
        northScore += total;
    } else {
        southScore += total;
    }

    displayMessage(total + " graines capturées");
}

function wouldEmptyOpponent(captured){

    let total = 0;

    if(currentPlayer === "NORD"){
        for(let i=7;i<=13;i++){
            if(!captured.includes(i)) total += board[i];
        }
    } else {
        for(let i=0;i<=6;i++){
            if(!captured.includes(i)) total += board[i];
        }
    }

    return total === 0;
}

// ==========================
// SOLIDARITE + COUPS LEGAUX
// ==========================

function opponentEmpty(){

    let start = currentPlayer === "NORD" ? 7 : 0;
    let end = currentPlayer === "NORD" ? 13 : 6;

    for(let i=start;i<=end;i++){
        if(board[i] > 0) return false;
    }

    return true;
}

function seedsToOpponent(index){

    let seeds = board[index];
    let cur = index;
    let skip = seeds > 13;
    let count = 0;

    while(seeds > 0){

        cur = nextPit[cur];

        if(skip && cur === index){
            cur = nextPit[cur];
        }

        if(currentPlayer === "NORD" && cur >= 7) count++;
        if(currentPlayer === "SUD" && cur <= 6) count++;

        seeds--;
    }

    return count;
}

function respectsSolidarity(index){

    if(!opponentEmpty()) return true;

    return seedsToOpponent(index) > 0;
}

function violatesRule7(index){

    if(currentPlayer === "NORD" && index !== 6) return false;
    if(currentPlayer === "SUD" && index !== 13) return false;

    const sent = seedsToOpponent(index);

    return sent === 1 || sent === 2;
}

function isLegalMove(index){

    if(board[index] === 0) return false;
    if(!respectsSolidarity(index)) return false;
    if(violatesRule7(index)) return false;

    return true;
}

function highlightMoves(){

    document.querySelectorAll(".pit").forEach(p=>{
        p.style.outline = "";
    });

    for(let i=0;i<14;i++){
        if(isLegalMove(i)){
            const el = document.querySelector(`[data-index="${i}"]`);
            if(el) el.style.outline = "3px solid gold";
        }
    }
}

// ==========================
// FIN BLOC 1
// ==========================

// ==========================
// FIN DE PARTIE
// ==========================

function remainingSeeds(){

    return board.reduce((a,b)=>a+b,0);
}

function campSeeds(player){

    let start = player === "NORD" ? 0 : 7;
    let end = player === "NORD" ? 6 : 13;

    let total = 0;

    for(let i=start;i<=end;i++){
        total += board[i];
    }

    return total;
}

function collectRemaining(){

    northScore += campSeeds("NORD");
    southScore += campSeeds("SUD");

    for(let i=0;i<14;i++){
        board[i] = 0;
    }
}

function winner(){

    if(northScore > southScore) return "NORD";
    if(southScore > northScore) return "SUD";
    return "MATCH NUL";
}

function showWinner(){

    const w = winner();

    let msg = "";

    if(w === "NORD") msg = "🏆 Victoire NORD";
    else if(w === "SUD") msg = "🏆 Victoire SUD";
    else msg = "🤝 Match nul";

    displayMessage(msg);

    alert(
        msg +
        "\nNord: " + northScore +
        "\nSud: " + southScore
    );
}

function checkEndGame(){

    // victoire directe
    if(northScore >= 40 || southScore >= 40){
        endGame();
        return;
    }

    // moins de 10 graines
    if(remainingSeeds() < 10){
        endGame();
        return;
    }

    // solidarité impossible
    if(opponentEmpty()){
        let possible = false;

        for(let i=0;i<14;i++){
            if(isLegalMove(i)){
                possible = true;
                break;
            }
        }

        if(!possible){
            endGame();
            return;
        }
    }
}

function endGame(){

    gameOver = true;

    collectRemaining();
    renderBoard();
    updateUI();

    showWinner();
}

// ==========================
// FIN DE TOUR
// ==========================

function endTurn(lastPit){

    checkEndGame();

    if(gameOver) return;

    currentPlayer =
        currentPlayer === "SUD"
        ? "NORD"
        : "SUD";

    updateUI();
    displayMessage("Tour du joueur " + currentPlayer);
}

// ==========================
// RESTART GAME
// ==========================

function restartGame(){

    for(let i=0;i<14;i++){
        board[i] = 5;
    }

    northScore = 0;
    southScore = 0;

    currentPlayer = "SUD";
    gameOver = false;

    renderBoard();
    displayMessage("Nouvelle partie");
}

// bouton restart
document.addEventListener("DOMContentLoaded",()=>{

    document
    .getElementById("restartBtn")
    .addEventListener("click", restartGame);

    renderBoard();
});

// ==========================
// INITIALISATION (sécurité)
// ==========================

renderBoard();

// ==========================
// FIN BLOC 2
// ==========================

// ==========================
// REGLES MODAL
// ==========================

const rulesModal = document.getElementById("rulesModal");
const rulesBtn = document.getElementById("rulesBtn");
const closeRules = document.getElementById("closeRules");

// ouvrir
rulesBtn.addEventListener("click", () => {
    rulesModal.classList.remove("hidden");
});

// fermer
closeRules.addEventListener("click", () => {
    rulesModal.classList.add("hidden");
});

// clic dehors pour fermer
rulesModal.addEventListener("click", (e) => {
    if (e.target === rulesModal) {
        rulesModal.classList.add("hidden");
    }
});
