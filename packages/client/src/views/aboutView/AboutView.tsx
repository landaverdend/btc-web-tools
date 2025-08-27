import ColoredText from '@/components/coloredText/ColoredText';
import bitcoinStandard from '@assets/bookRecs/bitcoinStandard.webp';
import brokenMoney from '@assets/bookRecs/brokenMoney.webp';
import historyOfMoneyAndBanking from '@assets/bookRecs/historyOfMoneyAndBanking.webp';

export default function AboutView() {
  return (
    <div className="flex flex-col justify-center items-center gap-10 text-zinc-50 bg-(--header-gray) p-5">
      <h1 className="text-2xl font-bold">
        <ColoredText color="var(--soft-orange-light)">About this site</ColoredText>
      </h1>

      <p className="text-lg w-4/5">
        This is mostly just a collection of little tools and visual-aids for my own learning. Maybe some day I'll add more stuff
        and build out a proper educational site for learning about the Bitcoin protocol.
        <br /> <br />
        For learning more about Bitcoin from a technical perspective, I highly reccomend going through{' '}
        <a href="https://learnmeabitcoin.com/" target="_blank" className="text-blue-300 hover:text-blue-400">
          Learn Me a Bitcoin
        </a>
        . In terms of learning the nitty-gritty details of the protocol in a non-academic context, I havent found anything better.
        <br /> <br />
        For understanding Bitcoin from an economic perspective, I have found the following books to be great resources:
        <br /> <br />
      </p>

      <div className="flex flex-col lg:flex-row justify-center items-center gap-5 w-4/5">
        <img src={bitcoinStandard} className="w-[300px] h-[450px]"></img>
        <img src={brokenMoney} className="w-[300px] h-[450px]"></img>
        <img src={historyOfMoneyAndBanking} className="w-[300px] h-[450px]"></img>
      </div>
    </div>
  );
}
