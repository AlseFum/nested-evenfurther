export default
    {
        universe: {
            title: "universe",
            line:"line for n1",
            slot:{seq:[{repeat:[1,10],value: "galatic_supercluster"}]}
        },
        galatic_supercluster:{
            title:"galatic supercluster",
            slot:["galaxy"]
        },
        galaxy:{
            title:"galaxy",
            slot:{seq:["galatic_center",{repeat:[2,10],value:"arm"}]}
        },
        galatic_center:{
            title:"galatic center",
            slot:{seq:["blackhole",{repeat:[2,10],value:"star_system"},"nebula","blackhole"]}
        },
        blackhole:{
            title:"blackhole",
            slot:"inside_the_blackhole"
        },
        inside_the_blackhole:{
            title:"inside the blackhole",
            slot:"whitehole"
        },
        whitehole:{
            title:"whitehole",
            slot:"universe"
        }
        ,
        star_system:{
            title:"star_system"
        },
        arm:{
            title:"arm"
        },
        nebula:{
            title:"nebula"
        }
    }