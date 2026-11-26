/* ===================================================================
 * 중1 · 2022 개정 동아(윤정미) 중학교 영어 1 — Lesson 5·6·7·8 원문 정본 + 우리말 해석 (본문암기용)
 * ===================================================================
 * 사용자 제공 교과서 본문 PDF(중1 동아윤 6과/7과/8과.pdf, 2026-11-17)에서 verbatim 전사. ★ 영어 임의 수정 금지.
 * 각 항목 = [영어, 우리말]. PDF 에 우리말이 없어 해석은 새로 썼다(중1 눈높이, 문장 단위 1:1).
 * 인명은 영문 그대로, 한국 이름 Minsu 만 '민수'. 곰 가족 = 아기 곰·엄마 곰·아빠 곰.
 *
 * ★ 문장 나누기
 *   - L6 은 챌린지 후기 글: 화자 표시(Olivia: / Domingo: …)는 그 글의 **첫 문장 앞에만** 붙인다.
 *     소제목(Challenge 01 Reduce Food Waste 등)은 본문 문장이 아니다.
 *   - L8 은 대화가 많은 이야기: 따옴표 안도 문장 끝마다 나누고, said ~ 류 화자 표시는
 *     따옴표 뒤에 오면 그 따옴표의 마지막 문장에, 앞에 오면 첫 문장에 붙인다.
 * ★ 인쇄본 표기 정리(철자·단어는 그대로): 닫는 따옴표가 여는 모양(“)으로 찍힌 곳은 ”로,
 *   느낌표 뒤 조판 공백(fun! ” · chair! ”)은 붙여 썼다. L7 영화 제목 Happy Days 의 이탤릭은 평문으로.
 * =================================================================== */

export const LESSONS = {
  /* L5 — 2026-11-26 추가. 목격자 진술 4편은 소제목(Ann Jones, a visitor …)이 화자라 영어는 원문 그대로 두고,
     각 진술 첫 문장의 우리말 앞에만 (방문객 Ann Jones) 처럼 화자를 밝혔다. 용의자 표(The Suspects)는 문장이 아니라 제외.
     작품명 Monalisa 의 이탤릭은 평문으로. */
  L5: [
    { title: 'Who Threw a Cake at the Monalisa?', rows: [
      ['Last Saturday, someone threw a cake at the Monalisa in the Botero Museum in Bogota, Colombia.', '지난 토요일, 누군가가 콜롬비아 보고타의 보테로 미술관에 있는 모나리자에 케이크를 던졌어요.'],
      ['There were four eyewitnesses.', '목격자가 네 명 있었어요.'],
      ['What did they say?', '그들은 뭐라고 말했을까요?'],
      ['Read the following, and find the criminal.', '다음 글을 읽고, 범인을 찾아보세요.'],
    ] },
    { title: 'Ann Jones, a visitor', rows: [
      ['I was looking at the Monalisa, and someone threw a cake at the painting.', '(방문객 Ann Jones) 저는 모나리자를 보고 있었는데, 누군가가 그 그림에 케이크를 던졌어요.'],
      ['I turned around and saw an old man.', '저는 뒤돌아서 한 노인을 보았어요.'],
      ['He was standing in front of a wheelchair.', '그는 휠체어 앞에 서 있었어요.'],
      ['I’m about 170 cm tall, and he was a little taller than me.', '저는 키가 약 170cm인데, 그는 저보다 조금 더 컸어요.'],
    ] },
    { title: 'Carlos Diaz, a janitor', rows: [
      ['An old man with gray hair was running away, and something fell off his head.', '(관리인 Carlos Diaz) 회색 머리의 한 노인이 달아나고 있었는데, 그의 머리에서 무언가가 떨어졌어요.'],
      ['It was his wig.', '그것은 그의 가발이었어요.'],
      ['I ran after him, but I couldn’t catch him.', '저는 그를 뒤쫓아 갔지만, 그를 잡을 수 없었어요.'],
      ['He was faster than me.', '그는 저보다 더 빨랐어요.'],
      ['In fact, the old man was not old.', '사실, 그 노인은 늙지 않았어요.'],
      ['He was a young man with long brown hair.', '그는 긴 갈색 머리의 젊은 남자였어요.'],
    ] },
    { title: 'Diego Perez, a guard', rows: [
      ['I went to the crime scene, and there were pieces of cake all over the painting.', '(경비원 Diego Perez) 제가 범행 현장에 가 보니, 그림 전체에 케이크 조각들이 있었어요.'],
      ['There was also a wheelchair near the painting, and I found a cake box next to the wheelchair.', '그림 근처에는 휠체어도 있었고, 저는 그 휠체어 옆에서 케이크 상자를 발견했어요.'],
      ['The box was from Camila’s Bakery.', '그 상자는 Camila’s Bakery(카밀라 빵집)의 것이었어요.'],
    ] },
    { title: 'Camila Santos, the owner of Camila’s Bakery', rows: [
      ['Last Friday, a young man came in.', '(Camila’s Bakery 주인 Camila Santos) 지난 금요일에 한 젊은 남자가 가게에 들어왔어요.'],
      ['I spoke to him in Spanish, but he didn’t understand me.', '저는 그에게 스페인어로 말했지만, 그는 제 말을 이해하지 못했어요.'],
      ['He spoke only English.', '그는 영어만 했어요.'],
      ['We had a lot of different cakes, but he just wanted the smallest one.', '우리 가게에는 여러 가지 케이크가 많았지만, 그는 가장 작은 것만 원했어요.'],
      ['We sold only one cake that day, so I remember him clearly.', '그날 우리는 케이크를 하나만 팔아서, 저는 그를 또렷이 기억해요.'],
      ['Oh, he had blue eyes.', '아, 그는 파란 눈을 가지고 있었어요.'],
    ] },
    { title: 'The Suspects', rows: [
      ['Now, look at the information about the suspects.', '이제, 용의자들에 대한 정보를 보세요.'],
      ['Who threw the cake at the Monalisa?', '누가 모나리자에 케이크를 던졌을까요?'],
    ] },
  ],
  L6: [
    { title: 'Join the Zero-Waste Challenge', rows: [
      ['Every day, we produce lots of waste, and the Earth is getting sicker and sicker.', '매일 우리는 많은 쓰레기를 만들어 내고, 지구는 점점 더 아파지고 있어요.'],
      ['Do you want to save the Earth?', '여러분은 지구를 구하고 싶나요?'],
      ['Then, join the zero-waste challenge, and share your stories.', '그렇다면, 제로 웨이스트 챌린지에 참여하고 여러분의 이야기를 공유해 주세요.'],
    ] },
    { title: 'Challenge 01 Reduce Food Waste', rows: [
      ['Olivia: My birthday was last Saturday, and my family and I ate out.', 'Olivia: 지난 토요일은 제 생일이었고, 가족과 저는 외식을 했어요.'],
      ['There were lots of leftovers, but we brought them home.', '남은 음식이 많았지만, 우리는 그것을 집으로 가져왔어요.'],
      ['The next day, I made a nice lunch out of them.', '다음 날, 저는 그것으로 근사한 점심을 만들었어요.'],
      ['FYI, you can find great cooking ideas for leftovers on the Internet.', '참고로, 인터넷에서 남은 음식을 활용한 훌륭한 요리 아이디어를 찾을 수 있어요.'],
    ] },
    { title: 'Challenge 02 Reuse', rows: [
      ['Domingo: My dog tore my bag.', 'Domingo: 우리 개가 제 가방을 찢었어요.'],
      ['I wanted to buy a new one, but I thought again.', '저는 새 가방을 사고 싶었지만, 다시 생각했어요.'],
      ['I learned that reusing is important for zero-waste living.', '저는 재사용이 제로 웨이스트 생활에 중요하다는 것을 배웠어요.'],
      ['So, I decided to fix it and reuse it.', '그래서 저는 그것을 고쳐서 다시 쓰기로 결심했어요.'],
      ['I’m not very good at sewing, and I don’t think that the bag looks perfect.', '저는 바느질을 그다지 잘하지 못하고, 가방이 완벽해 보이지는 않는 것 같아요.'],
      ['I guess it’s all right.', '그래도 괜찮은 것 같아요.'],
    ] },
    { title: 'Challenge 03 Say No to Single-Use Plastic', rows: [
      ['Emma: I often use food delivery services, but today I didn’t.', 'Emma: 저는 음식 배달 서비스를 자주 이용하지만, 오늘은 이용하지 않았어요.'],
      ['Instead, I walked to my favorite restaurant with a reusable container and picked up the food.', '대신, 저는 다회용 용기를 들고 가장 좋아하는 식당까지 걸어가서 음식을 받아 왔어요.'],
      ['I heard that plastic never goes away completely.', '저는 플라스틱이 결코 완전히 사라지지 않는다고 들었어요.'],
      ['I didn’t use any single-use plastic today.', '저는 오늘 일회용 플라스틱을 전혀 사용하지 않았어요.'],
      ['I felt good!', '기분이 좋았어요!'],
    ] },
    { title: 'Challenge 04 Recycle', rows: [
      ['Minsu: Yesterday, I took some plastic and glass bottles to a recycling machine near my house.', '민수: 어제, 저는 플라스틱병과 유리병 몇 개를 집 근처의 재활용 기계에 가져갔어요.'],
      ['I put them into the machine one by one, and I got some points in return.', '저는 그것들을 기계에 하나씩 넣었고, 그 대가로 포인트를 받았어요.'],
      ['What can I do with those points?', '그 포인트로 무엇을 할 수 있을까요?'],
      ['Well, I can use them like money.', '음, 그것들을 돈처럼 쓸 수 있어요.'],
      ['Don’t you think that’s cool?', '멋지다고 생각하지 않나요?'],
    ] },
  ],

  L7: [
    { title: 'The Director', rows: [
      ['Hi, I’m Jim Brown, the director of Happy Days.', '안녕하세요, 저는 Happy Days의 감독인 Jim Brown이에요.'],
      ['It’s a movie about the friendship between Tom and his dog Max.', '그것은 Tom과 그의 개 Max 사이의 우정에 관한 영화예요.'],
      ['A lot of people are working hard to create this movie.', '많은 사람들이 이 영화를 만들기 위해 열심히 일하고 있어요.'],
      ['Do you want to meet some of them?', '그들 중 몇 명을 만나 보고 싶나요?'],
    ] },
    { title: 'Location Manager', rows: [
      ['I’m Anna, and I found this beautiful beach.', '저는 Anna이고, 이 아름다운 해변을 찾았어요.'],
      ['I’m a location manager, and my job is to find perfect places for shooting.', '저는 촬영 장소 담당자이고, 제 일은 촬영하기에 완벽한 장소를 찾는 거예요.'],
      ['Of course, it is not easy, but I love my job.', '물론 쉽지는 않지만, 저는 제 일을 정말 좋아해요.'],
      ['I like to travel and enjoy challenges.', '저는 여행하는 것과 도전을 즐기는 것을 좋아해요.'],
    ] },
    { title: 'Director of Photography', rows: [
      ['I’m Peter, the director of photography for this movie.', '저는 이 영화의 촬영 감독인 Peter예요.'],
      ['I’m in charge of all the cameras.', '저는 모든 카메라를 담당하고 있어요.'],
      ['Today, Tom and Max are going to play together with a ball on the beach.', '오늘, Tom과 Max는 해변에서 공을 가지고 함께 놀 거예요.'],
      ['To capture their happy moments, I’m going to use drones.', '그들의 행복한 순간을 담기 위해, 저는 드론을 사용할 거예요.'],
    ] },
    { title: 'Animal Wrangler', rows: [
      ['I’m Jennifer.', '저는 Jennifer예요.'],
      ['I trained and took care of Max for a long time.', '저는 오랫동안 Max를 훈련시키고 돌봤어요.'],
      ['Max is a great actor, but he sometimes gets too excited when a lot of people are around.', 'Max는 훌륭한 배우지만, 주위에 사람이 많으면 가끔 너무 흥분해요.'],
      ['So, I use hand signals to calm him.', '그래서 저는 그를 진정시키기 위해 손 신호를 사용해요.'],
      ['Who am I?', '제가 누구일까요?'],
      ['I’m an animal wrangler.', '저는 동물 조련사예요.'],
    ] },
    { title: 'Film Editor', rows: [
      ['My name is Emma, and I’m a film editor.', '제 이름은 Emma이고, 저는 영화 편집자예요.'],
      ['My work begins after the shooting is over.', '제 일은 촬영이 끝난 후에 시작돼요.'],
      ['To create a better story, I can change the order of scenes or delete some of them.', '더 좋은 이야기를 만들기 위해, 저는 장면의 순서를 바꾸거나 그중 일부를 삭제할 수 있어요.'],
      ['Storytelling skills are important for my job, so I read a lot.', '이야기를 만드는 능력이 제 일에 중요해서, 저는 책을 많이 읽어요.'],
    ] },
    { title: 'Foley Artist', rows: [
      ['I’m Chris, and I’m a Foley artist.', '저는 Chris이고, 폴리 아티스트예요.'],
      ['I create sound effects in my studio when recording on location is not easy.', '저는 현장에서 녹음하기가 쉽지 않을 때 제 작업실에서 음향 효과를 만들어요.'],
      ['Listen carefully.', '잘 들어 보세요.'],
      ['Do you hear the sound of waves?', '파도 소리가 들리나요?'],
      ['I made that sound with rice and a plastic container.', '저는 쌀과 플라스틱 용기로 그 소리를 만들었어요.'],
      ['Doesn’t it sound real?', '진짜처럼 들리지 않나요?'],
    ] },
  ],

  L8: [
    { title: 'Goldilocks and Social Media', rows: [
      ['There was a little girl with golden hair in a small town.', '작은 마을에 금발 머리를 한 어린 소녀가 있었다.'],
      ['Her name was Goldilocks.', '그녀의 이름은 Goldilocks였다.'],
      ['She liked to share photos on social media.', '그녀는 소셜 미디어에 사진을 공유하는 것을 좋아했다.'],
      ['At first, she posted everyday things, but people didn’t give her many likes.', '처음에 그녀는 일상적인 것들을 올렸지만, 사람들은 그녀에게 ‘좋아요’를 많이 주지 않았다.'],
      ['“What should I do to get more likes?” she thought.', '“‘좋아요’를 더 많이 받으려면 어떻게 해야 할까?” 그녀는 생각했다.'],
      ['“I know!', '“알았다!'],
      ['I should post funny pictures.”', '재미있는 사진을 올려야겠어.”'],
      ['Now, her posts were getting a lot of likes, and Goldilocks was happy.', '이제 그녀의 게시물은 ‘좋아요’를 많이 받고 있었고, Goldilocks는 행복했다.'],
      ['Her followers, however, soon got bored.', '하지만 그녀의 팔로워들은 곧 지루해졌다.'],
      ['So, she decided to post more shocking pictures.', '그래서 그녀는 더 충격적인 사진을 올리기로 결심했다.'],
      ['One day, she was taking a walk in the forest and found a cottage.', '어느 날, 그녀는 숲에서 산책을 하다가 오두막 한 채를 발견했다.'],
      ['She knocked on the door, but there was no answer.', '그녀는 문을 두드렸지만, 아무 대답이 없었다.'],
      ['It was getting dark, and it started to rain.', '날이 어두워지고 있었고, 비가 내리기 시작했다.'],
      ['She opened the door and walked inside.', '그녀는 문을 열고 안으로 걸어 들어갔다.'],
    ] },
    { title: 'In the Bears’ Cottage', rows: [
      ['There were three bowls of soup on a table.', '식탁 위에 수프 세 그릇이 있었다.'],
      ['She ate the smallest one and took selfies with a smile.', '그녀는 가장 작은 그릇의 수프를 먹고 미소를 지으며 셀카를 찍었다.'],
      ['There were also three chairs.', '의자도 세 개 있었다.'],
      ['She jumped on the smallest one again and again.', '그녀는 가장 작은 의자 위에서 계속해서 뛰었다.'],
      ['It broke, but she didn’t care.', '의자가 부서졌지만, 그녀는 신경 쓰지 않았다.'],
      ['“It’s so fun!” shouted Goldilocks.', '“정말 재미있다!” Goldilocks가 소리쳤다.'],
      ['She took selfies again and posted all the selfies on social media.', '그녀는 다시 셀카를 찍고 그 셀카를 모두 소셜 미디어에 올렸다.'],
      ['Then, she went upstairs and found three beds.', '그러고 나서, 그녀는 위층으로 올라가 침대 세 개를 발견했다.'],
      ['She felt tired and fell asleep in the smallest bed.', '그녀는 피곤해서 가장 작은 침대에서 잠이 들었다.'],
      ['About an hour later, three bears came home.', '약 한 시간 후, 곰 세 마리가 집에 돌아왔다.'],
      ['“Someone ate my soup and broke my chair!” cried Baby Bear.', '“누군가 내 수프를 먹고 내 의자를 부쉈어요!” 아기 곰이 외쳤다.'],
      ['They went upstairs and saw Goldilocks.', '그들은 위층으로 올라가 Goldilocks를 보았다.'],
      ['Mother Bear found a phone next to Goldilocks.', '엄마 곰은 Goldilocks 옆에서 휴대 전화를 발견했다.'],
      ['“This is terrible!', '“이건 끔찍해요!'],
      ['Look at all these posts of our home,” shouted Mother Bear angrily.', '우리 집을 찍은 이 게시물들 좀 봐요.” 엄마 곰이 화가 나서 소리쳤다.'],
      ['Goldilocks jumped up in surprise.', 'Goldilocks는 깜짝 놀라 벌떡 일어났다.'],
      ['“You broke into our house and posted these pictures without our permission.', '“너는 우리 집에 몰래 들어와서 우리 허락도 없이 이 사진들을 올렸구나.'],
      ['Don’t you know these things are wrong?” said Father Bear.', '이런 일들이 잘못이라는 걸 모르니?” 아빠 곰이 말했다.'],
      ['“Please forgive me.', '“제발 용서해 주세요.'],
      ['I’m so sorry, and I’ll clean your house every day until the end of the summer,” said Goldilocks.', '정말 죄송해요, 여름이 끝날 때까지 매일 집을 청소할게요.” Goldilocks가 말했다.'],
    ] },
    { title: 'Goldilocks Learns Her Lesson', rows: [
      ['All summer long, Goldilocks worked hard.', '여름 내내, Goldilocks는 열심히 일했다.'],
      ['On the last day, Goldilocks said to Father Bear, “I deleted all my posts of your cottage, so please don’t worry.”', '마지막 날, Goldilocks는 아빠 곰에게 말했다. “오두막을 찍은 제 게시물을 모두 지웠으니, 걱정하지 마세요.”'],
      ['“You still don’t understand.', '“너는 아직도 이해하지 못하는구나.'],
      ['Other people already shared them on social media.', '다른 사람들이 이미 그것들을 소셜 미디어에 공유했단다.'],
      ['Your posts will live on forever,” said Father Bear.', '네 게시물은 영원히 남을 거야.” 아빠 곰이 말했다.'],
      ['“Oh, I didn’t think about that,” said Goldilocks.', '“아, 그건 생각하지 못했어요.” Goldilocks가 말했다.'],
      ['“From now on, I’ll think twice before I press POST.”', '“이제부터는 ‘게시’ 버튼을 누르기 전에 두 번 생각할게요.”'],
    ] },
  ],
};
