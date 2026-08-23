(()=>{
"use strict";
const VERSION=123;
let observer=null,queued=false,timer=null;
const OVERRIDES={
"Before starting a new carpentry task, what should be confirmed?":[
"The planned finish time and who is working nearby",
"Current drawings, method, hazards and task requirements",
"The cutting list from the last similar task on site",
"The timber delivery details and storage location"
],
"Machining timber will create dust. Which approach gives the best control?":[
"Open nearby doors and rely on natural airflow during machining",
"Use effective extraction with the specified face-fit-tested RPE",
"Wear basic safety glasses and sweep dust at the end",
"Reduce cutting speed and keep the machine guard partly open"
],
"A drawing dimension conflicts with the specification. What should you do?":[
"Use the drawing because it shows the dimensions visually",
"Stop and get clarification through the agreed project procedure",
"Use the specification because written information takes priority",
"Average the two dimensions and record what was used"
],
"Why should timber condition and moisture be considered before use?":[
"It determines which surface finish can be applied immediately",
"Movement or decay can affect dimensions, joints and service performance",
"It mainly affects how quickly fixings can be driven",
"It decides whether all timber species can be machined alike"
],
"What should a cutting list include?":[
"Finished component sizes and the planned order of assembly",
"Component quantities, sizes and suitable machining or cutting allowances",
"Material supplier details and the names of each operative",
"Delivery quantities and the date the components are required"
],
"A chisel edge is damaged. What is the correct response?":[
"Dress the edge lightly and continue if the tool still cuts",
"Sharpen it correctly and inspect the tool before using it again",
"Increase the striking force to compensate for the damaged edge",
"Round the cutting edge slightly to prevent further chipping"
],
"What should happen before adjusting or changing a blade or cutter?":[
"Switch the speed control to its lowest setting before touching it",
"Isolate the tool and follow the manufacturer's adjustment procedure",
"Keep the trigger released but leave the power supply connected",
"Ask another operative to hold the blade while it is adjusted"
],
"What is the main benefit of a well-made jig?":[
"It allows different component sizes to be made without resetting",
"It helps repeat an operation accurately and consistently",
"It compensates automatically for worn or blunt cutting edges",
"It removes the need to check datum or reference faces"
],
"Another trade needs access through your work area. What should you do?":[
"Finish the current task first and ask them to wait outside the area",
"Agree a safe sequence and communicate any access restrictions",
"Move their equipment to create a route without interrupting them",
"Leave a clear route but continue without discussing the interface"
],
"Which action supports an inclusive workplace?":[
"Give technical tasks only to people who already know the team",
"Use respectful language and give everyone a fair chance to contribute",
"Avoid difficult conversations with new starters until they settle in",
"Use the same informal banter with everyone so nobody is singled out"
],
"Where should a worker look for wellbeing support?":[
"Speak only to colleagues who have dealt with the same problem",
"Use the employer or site support route and appropriate professional services",
"Wait until the issue affects work before asking for support",
"Rely on informal online advice before using workplace support"
],
"Which material practice best supports sustainability?":[
"Order extra material so shortages never interrupt the programme",
"Plan cuts, protect reusable material and segregate waste correctly",
"Combine waste streams so collections can be reduced",
"Reuse offcuts without checking whether they remain suitable"
],
"Which item is normally associated with first-fix site carpentry?":[
"Fit internal doors and architraves after wall finishes are complete",
"Install floor joists or other structural timber before finishes",
"Fit skirting boards once flooring and decoration are complete",
"Install final ironmongery after doors have been adjusted"
],
"How should a structural timber fixing be selected?":[
"Match the fixing diameter to the timber thickness only",
"Use the drawing or specification for load, substrate and exposure",
"Choose the longest fixing that can be installed without splitting timber",
"Reuse a removed fixing if its thread and head appear undamaged"
],
"What should be checked before using a timber sizing table?":[
"Check the timber price, nominal size and available stock length",
"Check member type, span, loading, spacing and timber grade match the table",
"Use the next smaller value if the exact span is not listed",
"Confirm the timber has been treated and painted before sizing"
],
"What controls the length and angles of a common rafter?":[
"Roof span, pitch or rise, and the specified overhang and details",
"Tile gauge, batten size and the width of the roof covering",
"Scaffold width, eaves height and access around the roof",
"Number of rafters, labour available and planned installation sequence"
],
"Why must a birdsmouth not be over-cut?":[
"It mainly makes the eaves finish harder to trim accurately",
"It can reduce the effective rafter section and bearing performance",
"It increases the roof pitch by shortening the effective run",
"It changes the timber grade required for the remaining rafters"
],
"Why is the designed fall important on a flat roof?":[
"To create space for insulation and improve ventilation below the deck",
"To direct water to the intended outlet and limit ponding",
"To compensate for variation in joist depth across the roof",
"To reduce the number of weatherproofing layers required"
],
"Before transferring a datum with a laser level, what should be checked?":[
"Battery level, receiver position and distance to the next trade",
"Instrument suitability, stability and an accuracy check before use",
"That the laser line is visible from every part of the work area",
"That the datum agrees with the nearest existing finished surface"
],
"Which task is typically second-fix carpentry?":[
"Installing structural joists and roof members before services",
"Fitting skirting, architrave or internal doors after finishes are ready",
"Forming temporary edge protection around new floor openings",
"Setting out and installing sole plates before wall framing"
],
"What should be checked before permanently fixing a door lining?":[
"Head length, hinge side and the nearest finished floor datum",
"Plumb, level, square, opening size and allowance for finishes",
"Jamb thickness, screw spacing and the door manufacturer's logo",
"Only the diagonal measurements after the lining is fully fixed"
],
"How should a hinge recess be prepared?":[
"Slightly deeper than the hinge leaf so adjustment can be made later",
"To the marked position and depth so the hinge leaf sits correctly",
"To the screw length so the hinge can pull itself into the timber",
"With a rounded recess so the corners do not need to be chopped"
],
"What is the purpose of scribing a timber component?":[
"Transfer an irregular profile or junction so the component fits closely",
"Transfer the component thickness so a fixing line can be marked",
"Mark a standard clearance around the component before trimming",
"Increase the component size so it can be planed after installation"
],
"A joist hanger is being installed. Which information takes priority?":[
"A similar installation photographed on another part of the project",
"The design and manufacturer's specified fixing schedule",
"The nail pattern that uses the fewest fixings while holding the hanger",
"The fixing layout normally preferred by the operative"
],
"Why must components in a fire-door assembly match the approved specification?":[
"To keep the appearance and ironmongery consistent across the project",
"Substitution can compromise the tested fire and smoke performance",
"To keep the finished door weight within the normal handling range",
"To make later adjustment of hinges and seals easier during fitting"
],
"When may a guard on fixed workshop machinery be adjusted?":[
"When the machine is running slowly and the cutter is clear of timber",
"After isolation and using the correct guard-setting procedure",
"When a second person controls the stop switch during adjustment",
"Whenever the guard prevents a clear view of the cutting line"
],
"What should be done if a machine's extraction is not working effectively?":[
"Finish the current component and stop before starting the next batch",
"Stop and report the fault using the workshop procedure",
"Use additional RPE and continue until maintenance becomes available",
"Open doors and windows to increase general workshop ventilation"
],
"What is a setting rod used for in architectural joinery?":[
"Record component quantities, timber sections and machining allowances",
"Set out full-size component, joint and feature positions",
"Check moisture content and record acceptable timber before machining",
"Transfer machine settings between different pieces of fixed equipment"
],
"Why are face-side and face-edge marks used?":[
"Show which surfaces will remain visible after final assembly",
"Provide consistent reference surfaces for setting out and machining",
"Identify which faces should receive adhesive during assembly",
"Mark the waste side of every cut so components cannot be reversed"
],
"What helps matching mortise-and-tenon components assemble accurately?":[
"Mark each component from its nearest finished edge to reduce waste",
"Use consistent datums and check shoulders and fit before assembly",
"Make the tenon slightly oversize so the joint tightens when clamped",
"Machine both shoulders from opposite faces to balance any inaccuracy"
],
"Why is a dry assembly useful before adhesive is applied?":[
"It confirms the adhesive open time before the components are clamped",
"It checks joint fit, dimensions and squareness while adjustment is possible",
"It allows clamps to be positioned so fewer are needed during gluing",
"It conditions the timber to the workshop before final finishing"
],
"Before gluing a window frame, which check is most useful?":[
"Longest member, glazing size and the preservative colour",
"Joint fit, rebates, overall size and equal diagonals",
"Only the outside dimensions because joints will pull square when clamped",
"Each component thickness and whether all pieces are identical in length"
],
"A door lining head and jambs are being prepared. What should control their sizes?":[
"The nearest standard stock length and the available machining allowance",
"The drawing or setting rod, joint detail and required finished opening",
"The workshop bench size and the easiest sequence for machining the parts",
"The dimensions of the last lining made for the same building"
],
"What should be checked when a timber door is clamped after assembly?":[
"Adhesive squeeze-out, clamp spacing and one stile length",
"Overall dimensions, diagonals, joint closure and flatness",
"The position of the lock block and colour match of the timber only",
"That every clamp is tightened to the same handle position"
],
"How should a lock or hinge recess be set out?":[
"Use the fitting, drawing and consistent product datums",
"Measure from the nearest end and centre the fitting by eye",
"Set the recess after finishing so the coating marks the correct depth",
"Use screw length and head size to determine the position of the fitting"
],
"What is the safest response to a finishing product not listed in the specification?":[
"Apply a small amount to the finished face and judge it after drying",
"Check compatibility and obtain approval before using the product",
"Mix it with the specified finish so the final colour remains consistent",
"Apply additional coats so any difference in performance is reduced"
],
"What should a worker do with site induction and safety-sign information?":[
"Use it mainly during supervised tasks and rely on experience afterwards",
"Understand and follow it throughout the work",
"Follow company rules instead if they differ from the site arrangements",
"Use the induction only for the work area where it was delivered"
],
"An uncontrolled hazard presents serious and immediate danger. What is the correct action?":[
"Reduce the pace and continue while watching the hazard closely",
"Stop work, move to safety and report it through the site procedure",
"Photograph the hazard and continue until a supervisor reaches the area",
"Wait for the next planned break before raising the issue"
],
"What should be considered before moving a heavy masonry component?":[
"The shortest route, delivery time and whether the load can be split",
"Load, individual capability, task, environment and suitable assistance",
"The number of people nearby and how quickly the component is needed",
"Whether the component can be carried without changing hand position"
],
"On hearing the evacuation alarm, what should you do?":[
"Finish making the immediate area safe before leaving the workface",
"Follow the site emergency procedure and go to the designated assembly point",
"Collect personal belongings and then leave by the nearest available route",
"Move the site vehicle outside the work area before reporting to assembly"
],
"What should influence the selected method of work?":[
"The fastest sequence, available labour and the preferred hand tools",
"Project information, resources, conditions and the risk assessment",
"The method used successfully on the previous project with similar work",
"The cheapest available materials and the shortest planned programme"
],
"The project information is insufficient to choose a safe method. What should happen?":[
"Use the closest standard detail and record the assumption for later",
"Obtain the necessary information from an authorised source",
"Start non-critical parts of the work and decide the missing detail later",
"Use a drawing from another area if the dimensions appear similar"
],
"What makes a useful personal work sequence?":[
"The order preferred by the operative and the easiest tasks to complete first",
"An order based on the work, resources, dependencies and site programme",
"Starting several activities together so delays in one do not stop progress",
"Keeping the sequence independent from other occupations to avoid interference"
],
"A delay will affect the agreed programme. What should you do?":[
"Absorb the delay by reducing non-essential checks later in the task",
"Identify the effect and inform the relevant person promptly",
"Change the sequence of another occupation so your activity stays on programme",
"Continue to the original plan and report the delay when the task is complete"
],
"Which choice best supports low-carbon working?":[
"Order additional materials early to prevent repeat deliveries later",
"Plan quantities and methods to reduce waste and unnecessary plant use",
"Put reusable offcuts into general waste if separate storage would take space",
"Leave frequently used plant running between short tasks to avoid restart time"
],
"Which behaviour supports equality and diversity at work?":[
"Give new starters fewer technical discussions until they know the team",
"Communicate respectfully and adapt so relevant people can participate",
"Use the same communication style with everyone regardless of support needs",
"Allocate work according to who normally performs each type of task"
],
"Your work will affect another occupation's access. What should you do?":[
"Complete your activity first and tell the other occupation when the route is free",
"Clarify and coordinate the activities with the people involved",
"Move their materials to create temporary access through your work area",
"Leave a narrow route and assume they will ask if more access is required"
],
"Which method can help set out a right angle on site?":[
"Use a correctly measured 3-4-5 triangle at a suitable scale",
"Measure equal distances along both sides and connect the end points",
"Follow the nearest existing wall once its length has been checked",
"Set both lines from the same datum without checking the diagonal"
],
"What should control the thin-joint masonry system and joint requirements?":[
"The mortar and block arrangement used on the previous conventional wall",
"The current design, system specification and manufacturer's instructions",
"The block dimensions and the operative's preferred adhesive consistency",
"The standard brickwork detail used elsewhere on the same project"
],
"Why is the first course especially important in thin-joint masonry?":[
"It is the easiest course to adjust after the wall has reached full height",
"Its line, level and accuracy establish the base for subsequent thin beds",
"It determines adhesive colour and whether later joints need tooling",
"It removes the need to check gauge once the second course is installed"
],
"How should thin-joint bed thickness be controlled?":[
"Add adhesive locally to correct level differences as the wall rises",
"Use the specified applicator and system method on accurately prepared units",
"Judge each bed visually and adjust with conventional jointing tools",
"Use a thicker bed at openings and reduce it again through straight runs"
],
"Which checks should continue as thin-joint walling rises?":[
"Overall wall height and opening positions once each lift is complete",
"Line, level, plumb, gauge and key opening dimensions",
"Adhesive colour, block batch and the amount of waste produced",
"Only the first course and final course because intermediate beds are fixed"
],
"A block or adhesive is not approved for the selected thin-joint system. What should you do?":[
"Use it in non-loadbearing or concealed parts if the dimensions are similar",
"Stop and obtain a compatible approved resource",
"Blend it with the approved product so the system remains consistent",
"Increase bed thickness slightly to accommodate the different component"
],
"Cutting thin-joint blocks will create dust. What controls are required?":[
"Use general ventilation and dry sweep the area after cutting is finished",
"Use the task-specified dust control, extraction or suppression and suitable RPE",
"Work outside with the guard fitted and rely on natural air movement",
"Reduce cutting speed and wear eye protection while dust settles"
],
"Why should contact surfaces be clean before thin-joint adhesive is applied?":[
"It makes units lighter and easier to position before the adhesive sets",
"Dust or debris can reduce consistent contact and bond",
"It stops the units absorbing moisture from the adhesive too quickly",
"It allows the same bed thickness to be used without checking level"
],
"How should lintels and opening details be formed in thin-joint masonry?":[
"Use the nearest conventional masonry detail if the opening size is similar",
"Use the current drawing and system specification",
"Form the opening first and confirm lintel bearing after the wall is complete",
"Use standard bearing dimensions regardless of the selected system component"
],
"What is the correct response when weather could affect fresh thin-joint work?":[
"Continue if the units are dry and cover the wall only at the end of the shift",
"Use specified protection or stop work when conditions are unsuitable",
"Add a small amount of water to the adhesive when temperatures are high",
"Protect stored materials but leave newly laid work exposed for ventilation"
],
"A service opening is needed through the thin-joint wall. What should happen?":[
"Form it at the easiest position and tell the service trade afterwards",
"Coordinate it with the design and relevant occupations before forming it",
"Leave it until finishes are complete so its final position is obvious",
"Move nearby reinforcement locally if it obstructs the required opening"
],
"What should a thin-joint material calculation include?":[
"Wall area, full opening sizes and one fixed percentage for waste",
"Wall area or volume, openings, unit coverage and specified waste allowance",
"Total wall length, number of corners and the adhesive colour required",
"A full spare pack for each elevation regardless of calculated consumption"
],
"Delivered blocks are damaged beyond the permitted quality. What should you do?":[
"Use them in concealed locations where the damaged face will not be seen",
"Segregate and report them, then obtain suitable replacements",
"Use additional adhesive to fill damaged edges and maintain joint thickness",
"Trim the damaged area and use the block if its overall size remains close"
],
"What should be established before a masonry repair method is selected?":[
"The visible colour difference, age of the wall and easiest access route",
"The defect, likely cause, extent and specified repair outcome",
"The fastest removal method and the replacement units already available",
"Only the size of the visible damaged area before opening the work"
],
"Why should replacement masonry and mortar be compatible with the existing work?":[
"It helps the repair match colour and reduces the need for later cleaning",
"Incompatible strength, movement or moisture behaviour can cause further damage",
"It ensures every repair can be made with the same mortar mix throughout",
"It mainly prevents visible differences between old and new masonry"
],
"Before removing a damaged unit, what should be protected?":[
"The new replacement unit, tools and the immediate working platform",
"Retained masonry, adjacent finishes, people and surrounding area",
"Only the surfaces directly touching the damaged unit being removed",
"Loose materials below the repair while the retained wall can remain exposed"
],
"A proposed repair may affect structural stability. What should happen?":[
"Remove a slightly larger area so the repair can be completed more quickly",
"Stop and obtain specified temporary support or authorised advice",
"Work in smaller sections while relying on the retained mortar above",
"Continue using hand tools only because they create less vibration"
],
"What is the aim when cutting out defective masonry?":[
"Create a wider opening so replacement units can be adjusted easily",
"Remove specified material while minimising damage to sound work",
"Break adjoining joints fully so the repair bonds to fresh mortar on all sides",
"Keep any removed unit that looks reusable even if its defect is uncertain"
],
"How should a joint be prepared for repointing?":[
"Rake the face lightly and apply new mortar over the remaining joint",
"Remove defective material to the specified sound depth and clean the joint",
"Dampen the surface and press new mortar into the existing joint without raking",
"Seal the joint first so loose material stays in place during repointing"
],
"What should control whether a repair background is dampened before mortar is placed?":[
"The operative's normal routine and how quickly the mortar needs to be placed",
"The repair specification, material condition and environmental conditions",
"The wall colour, age of the building and whether the joint is visible",
"The number of operatives available and the planned length of the repair"
],
"Which mortar should be used for a masonry repair?":[
"The strongest compatible-looking mix available from the site store",
"The compatible mix stated in the repair specification",
"Any remaining mortar from adjacent work if its colour is close",
"A cement-rich mix so the repaired joint develops strength quickly"
],
"Why must a completed repair be protected during curing?":[
"To dry the mortar quickly and prevent marks from later site activity",
"To control moisture loss, rain, frost or impact as specified",
"To avoid carrying out further inspection while the repair gains strength",
"To increase surface hardness by keeping the joint exposed to moving air"
],
"Cracking continues beyond the area shown for repair. What should you do?":[
"Complete the specified area and note the additional crack on the job sheet",
"Stop and report the changed condition for reassessment",
"Fill the visible extension with the same material without changing the scope",
"Remove additional masonry until the full end of the crack can be seen"
],
"Why should unexpected concealed defects be recorded and reported?":[
"They provide a record of why the task may take longer than originally planned",
"They may change the repair method, resources, safety or programme",
"They mainly justify using additional material beyond the original quantity",
"They are only required when the defect can be photographed clearly"
],
"What should happen to repair tools after use?":[
"Leave mortar residue until the next shift so cleaning does not damage edges",
"Clean, inspect, maintain and store them using the correct procedure",
"Store them damp so mortar residue remains soft for the next use",
"Replace cutting tools after each repair rather than inspecting their condition"
],
"What should control the installation of a proprietary masonry support angle?":[
"Use a similar project detail if the angle section and wall thickness match",
"The approved design and manufacturer's system instructions",
"Set anchor spacing to suit the nearest available mortar joints",
"Use the fixing pattern normally adopted for similar support angles"
],
"The substrate differs from the support-system design. What should you do?":[
"Use a longer fixing of the same type so the designed embedment is maintained",
"Stop and obtain authorised clarification",
"Add extra fixings locally to compensate for the changed substrate",
"Reduce spacing between anchors and continue with the original system"
],
"What should be established before fixing a specialist masonry element?":[
"Delivery weight, available lifting method and nearest mortar joint",
"Correct datum, line, level, position and interfaces",
"The scaffold lift height and easiest position for the fixing equipment",
"The finished brick colour and the sequence planned by the operative"
],
"Why must cavity fire barriers remain continuous at joints and interfaces?":[
"It keeps the barrier rigid enough to support wet mortar at the cavity edge",
"Gaps can compromise the intended fire and smoke performance",
"It allows the barrier to replace wall ties where the cavity is narrow",
"It improves the bond of finishes applied around the barrier later"
],
"How should a wind post be positioned?":[
"Place it where it causes the least obstruction to services and finishes",
"Use the approved line, level, fixing and connection details",
"Align it to the nearest masonry joint so fewer cuts are needed",
"Set the base first and adjust the head connection to suit the wall"
],
"Which components should be used in a proprietary masonry starter system?":[
"A proprietary strip with compatible-looking ties from another system",
"The specified compatible system components and fixings",
"Any new fixings of the correct diameter if the original grade is unavailable",
"Standard wall ties built into mortar without the proprietary starter strip"
],
"A support angle clashes with another trade's service. What should happen?":[
"Trim the support angle locally if the remaining section still appears stiff",
"Stop and coordinate an authorised resolution with the relevant people",
"Move the service slightly if enough flexibility remains in its route",
"Omit the nearest fixing and add an extra fixing farther from the clash"
],
"A specified specialist fixing is unavailable. What is the correct response?":[
"Use the next smaller fixing and reduce spacing between fixings",
"Seek an approved equivalent through the project procedure",
"Use a different material grade if the diameter and length are unchanged",
"Leave the connection loose until the specified fixing becomes available"
],
"A specialist masonry element is heavy and awkward. What should be planned?":[
"Use a two-person lift if the travel distance is short and level",
"Plan a suitable lifting method, access and control of the load",
"Move it manually onto the scaffold before deciding the final position",
"Remove temporary lifting points once the element is clear of storage"
],
"How should exposed finished specialist masonry be protected?":[
"Use waterproof sheeting tightly wrapped so no moisture reaches the face",
"Use specified non-damaging protection while allowing required curing and drainage",
"Cover fixings and joints before inspection so the finished face stays clean",
"Wash marks with a strong cleaner before applying general site protection"
],
"A fixing requires a stated installation torque. What should be used?":[
"Tighten until the fixing feels secure and record the final handle position",
"Use the specified verified method and suitable calibrated equipment where required",
"Use the longest available lever so all fixings reach a similar resistance",
"Check one representative fixing and apply the same effort to the remainder"
],
"Why should specialist elements be checked before they are concealed?":[
"It provides a photographic record before finishes make the work harder to see",
"Fixings, continuity and interfaces may no longer be accessible later",
"It avoids having to record the work after surrounding construction is complete",
"It allows small installation defects to be left for finishes to correct later"
],
"What should control a drainage run's line, level and fall?":[
"The trench profile and the level of the nearest existing surface",
"The approved drainage design and specified datum",
"The position of the nearest fence and easiest excavation route",
"Pipe colour, socket direction and the depth reached by the excavator"
],
"Before entering or working beside a drainage trench, what must be confirmed?":[
"That the pipe and bedding material have arrived at the work area",
"The excavation controls, access and ground conditions are safe",
"That the trench is narrow enough for the pipe to be positioned easily",
"That excavated spoil is close enough to use later for backfilling"
],
"Why is correctly prepared bedding important below a drainage pipe?":[
"It helps increase the pipe gradient if excavation levels vary slightly",
"It provides continuous support and helps maintain line and fall",
"It allows pipe joints to be made without checking socket alignment",
"It reduces the need for testing because the pipe is held firmly"
],
"How should pipe sockets, seals and lubricant be assembled?":[
"Use a general-purpose lubricant if it does not visibly affect the seal",
"Follow the pipe-system manufacturer's assembly instructions",
"Remove the seal temporarily if the socket is difficult to push home",
"Use light hammering on the socket when hand pressure is insufficient"
],
"Why should open drainage pipe ends be capped during installation?":[
"They help maintain the designed fall while sections are left unsupported",
"They prevent debris entering and obstructing or damaging the system",
"They remove the need to clean the pipe before later testing",
"They keep the pipe rigid while surrounding material is compacted"
],
"Why is an insertion-depth mark useful on a push-fit drainage joint?":[
"It identifies the pipe grade so the correct seal can be selected",
"It shows whether the pipe has reached the required insertion position",
"It replaces the need to inspect the seal before the joint is assembled",
"It records the trench depth at the point where the pipe was installed"
],
"Where should rodding or inspection access be provided?":[
"At hidden positions where covers will not interrupt the finished surface",
"At design-required locations so the system can be inspected and cleared",
"At the midpoint of every straight pipe run regardless of its length",
"After backfilling, wherever access can be formed without disturbing the pipe"
],
"What is most important during initial backfill around a pipe?":[
"Use coarse site-won material first so the pipe is quickly restrained",
"Use specified material and placement without disturbing line, fall or joints",
"Remove side support as backfill rises so the pipe can settle naturally",
"Compact directly above the pipe early to prevent later movement"
],
"When should a new drainage run be tested and checked?":[
"After final backfill so the completed ground provides normal operating support",
"At the specified stage before concealment or backfill prevents inspection",
"Before sockets are fully inserted so leakage paths can be seen during assembly",
"Only when the drainage connects directly to an existing live system"
],
"A drainage test fails. What should happen next?":[
"Complete backfill to stabilise the pipe before carrying out a second test",
"Keep the work accessible, identify and rectify the cause, then retest",
"Increase the permitted test loss slightly if all joints appear visually sound",
"Accept a small loss if the system drains freely and no leak is visible"
],
"How should foul and surface-water connections be identified?":[
"Use pipe colour and the nearest chamber to identify the intended destination",
"Use approved drainage information and verified connection points",
"Connect to the nearest manhole if its invert level suits the required fall",
"Use flow direction and smell to confirm which system the chamber serves"
],
"What should a drainage quantity take-off include?":[
"Straight pipe length, number of trenches and a standard waste percentage",
"Pipe lengths, fittings, access components, bedding or surround and a justified allowance",
"Pipe length and chamber count only, with fittings added during installation",
"A fixed extra quantity based on project size rather than the drainage design"
]
};
function patch(){
  queued=false;clearTimeout(timer);timer=null;
  const box=document.querySelector(".evia-arp-layer .evia-arp-options"),prompt=document.querySelector(".evia-arp-layer .evia-arp-question")?.textContent?.trim();
  if(!box||!prompt)return;
  if(box.dataset.integrity!=="118"){queue(16);return}
  if(box.dataset.qualityV123==="1")return;
  const replacement=OVERRIDES[prompt],buttons=[...box.querySelectorAll(":scope > [data-arp-answer]")];
  if(replacement&&buttons.length===4){
    buttons.forEach(button=>{const original=Number(button.dataset.arpAnswer);if(Number.isInteger(original)&&original>=0&&original<4&&replacement[original])button.textContent=replacement[original]})
  }
  box.dataset.qualityV123="1";
  buttons.forEach((button,index)=>button.setAttribute("aria-label",`Option ${String.fromCharCode(65+index)}. ${button.textContent.trim()}`))
}
function queue(delay=0){if(queued)return;queued=true;if(delay){timer=setTimeout(()=>requestAnimationFrame(patch),delay);return}requestAnimationFrame(patch)}
function relevant(records){return records.some(record=>{const target=record.target instanceof Element?record.target:record.target?.parentElement;if(target?.closest?.(".evia-arp-layer"))return true;return [...record.addedNodes].some(node=>node.nodeType===1&&(node.matches?.(".evia-arp-layer,.evia-arp-options")||node.querySelector?.(".evia-arp-layer,.evia-arp-options")))})}
function start(){queue(20);observer=new MutationObserver(records=>{if(relevant(records))queue(8)});observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:["data-integrity"]})}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
window.EviaArpDistractors=Object.freeze({version:VERSION,count:Object.keys(OVERRIDES).length,refresh:()=>queue(0)});
})();
